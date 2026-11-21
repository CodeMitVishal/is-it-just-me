// Runs the generated Google Apps Script (cloud/apps-script/Code.gs) inside a simulated Apps Script
// environment: fake UrlFetchApp (saved real provider responses), fake GitHub API, fake
// PropertiesService / ScriptApp / Utilities. Proves the cloud updater works before it goes to Google.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { ROOT, fixture } from './helpers.js';
import { buildBundle } from '../tools/build-apps-script.js';
import { normalizeSnapshot } from '../web/js/domain/snapshot.js';

const GITHUB = 'https://api.github.com/repos/CodeMitVishal/is-it-just-me-data';
const signed = (buf) => [...buf].map((b) => (b > 127 ? b - 256 : b)); // Apps Script byte[] is signed

/** In-memory GitHub: the data repo's main branch, trees with inline content, contents API. */
function fakeGitHub() {
  const files = new Map([['README.md', '# data only']]);
  const gh = { files, commits: [], forced: [], authHeaders: new Set(), sha: 'c0', trees: new Map([['t0', new Map(files)]]), commitTree: new Map([['c0', 't0']]) };
  let n = 0;
  gh.handle = (method, url, body, headers) => {
    gh.authHeaders.add(headers.Authorization);
    const p = url.slice(GITHUB.length);
    if (method === 'get' && p === '/git/ref/heads/main') return [200, { object: { sha: gh.sha } }];
    if (method === 'get' && p.startsWith('/git/commits/')) return [200, { tree: { sha: gh.commitTree.get(p.split('/').pop()) } }];
    if (method === 'get' && p.startsWith('/contents/')) {
      const file = gh.trees.get(gh.commitTree.get(gh.sha)).get(p.slice('/contents/'.length).split('?')[0]);
      return file === undefined ? [404, { message: 'Not Found' }] : [200, { content: Buffer.from(file).toString('base64') }];
    }
    if (method === 'post' && p === '/git/trees') {
      const tree = new Map(gh.trees.get(body.base_tree));
      for (const e of body.tree) tree.set(e.path, e.content);
      const sha = `t${++n}`;
      gh.trees.set(sha, tree);
      return [201, { sha }];
    }
    if (method === 'post' && p === '/git/commits') {
      const sha = `c${++n}`;
      gh.commitTree.set(sha, body.tree);
      gh.commits.push(body);
      return [201, { sha }];
    }
    if (method === 'patch' && p === '/git/refs/heads/main') { gh.sha = body.sha; gh.forced.push(body.force); return [200, {}]; }
    return [404, { message: `unexpected ${method} ${p}` }];
  };
  gh.current = () => gh.trees.get(gh.commitTree.get(gh.sha));
  return gh;
}

/** Provider responses: real saved fixtures where we have them, "all fine" Statuspage otherwise. */
function providerResponse(url) {
  const byHost = [
    [/zoomstatus\.com/, fixture('statuspage-maint.json')],
    [/cloudflarestatus\.com/, fixture('statuspage-minor.json')],
    [/snowflake\.com/, fixture('statuspage-down.json')],
    [/health\.aws\.amazon\.com/, fixture('aws-utf16be.bin')],
    [/azure\.status\.microsoft/, fixture('azure-ok.xml')],
    [/status\.dev\.azure\.com/, fixture('azdo-ok.json')],
    [/slack-status\.com/, fixture('slack-ok.json')],
    [/status\.gitlab\.com/, fixture('statusio-ok.json')],
    [/status\.stripe\.com/, fixture('stripe-ok.json')],
    [/(status\.cloud\.google\.com|google\.com\/appsstatus)/, fixture('gcp-history.json')],
  ];
  const hit = byHost.find(([re]) => re.test(url));
  return hit ? hit[1] : fixture('statuspage-ok.json');
}

function createSandbox({ token = 'test-token', redirectFirst = false } = {}) {
  const gh = fakeGitHub();
  const fetched = [];
  const triggers = [];
  const logs = [];
  let redirected = false;
  const response = (code, buf, headers = {}) => ({
    getResponseCode: () => code,
    getContent: () => signed(buf),
    getContentText: () => buf.toString('utf8'),
    getHeaders: () => headers,
  });
  const sandbox = {
    console: { log: (m) => logs.push(String(m)), warn: (m) => logs.push(`WARN ${m}`), error: (m) => logs.push(`ERR ${m}`) },
    UrlFetchApp: {
      fetch(url, opts = {}) {
        fetched.push(url);
        if (url.startsWith(GITHUB)) {
          const [code, body] = gh.handle((opts.method || 'get').toLowerCase(), url, opts.payload ? JSON.parse(opts.payload) : null, opts.headers || {});
          return response(code, Buffer.from(JSON.stringify(body)));
        }
        if (redirectFirst && !redirected && /githubstatus\.com/.test(url)) {
          redirected = true;
          return response(302, Buffer.alloc(0), { Location: '/api/v2/summary.json?moved=1' });
        }
        return response(200, providerResponse(url));
      },
    },
    Utilities: {
      newBlob: (bytes) => ({
        getDataAsString(charset) {
          const buf = Buffer.from(bytes.map((b) => b & 255));
          if (charset === 'UTF-16LE') return buf.toString('utf16le');
          if (charset === 'UTF-16BE') { const sw = Buffer.alloc(buf.length); for (let i = 0; i + 1 < buf.length; i += 2) { sw[i] = buf[i + 1]; sw[i + 1] = buf[i]; } return sw.toString('utf16le'); }
          return buf.toString('utf8');
        },
      }),
      base64Decode: (s) => signed(Buffer.from(s, 'base64')),
    },
    PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => (k === 'GITHUB_TOKEN' ? token : null) }) },
    ScriptApp: {
      newTrigger: (fn) => ({ timeBased: () => ({ everyMinutes: (m) => ({ create: () => triggers.push({ fn, m }) }) }) }),
      getProjectTriggers: () => triggers.map((t) => ({ getHandlerFunction: () => t.fn, _t: t })),
      deleteTrigger: (t) => triggers.splice(triggers.indexOf(t._t), 1),
    },
  };
  vm.createContext(sandbox);
  vm.runInContext(buildBundle(), sandbox, { filename: 'Code.gs' });
  return { sandbox, gh, fetched, triggers, logs, run: () => vm.runInContext('run()', sandbox) };
}

test('the committed Code.gs is up to date (run: npm run build:gas)', () => {
  assert.equal(readFileSync(path.join(ROOT, 'cloud/apps-script/Code.gs'), 'utf8'), buildBundle());
});

test('one run reads every provider once and writes status.json + history + feeds in ONE commit', async () => {
  const env = createSandbox();
  await env.run();

  const catalog = JSON.parse(readFileSync(path.join(ROOT, 'config/services.json'), 'utf8'));
  const providerCalls = env.fetched.filter((u) => !u.startsWith(GITHUB));
  assert.equal(providerCalls.length, catalog.filter((s) => s.kind !== 'none').length, 'each provider fetched exactly once');
  assert.ok(env.fetched.every((u) => u.startsWith('https://')), 'https only');

  assert.equal(env.gh.commits.length, 1, 'exactly one commit per run');
  assert.deepEqual(env.gh.commits[0].parents, [], 'orphan commit → the data repo never grows');
  assert.deepEqual(env.gh.forced, [true]);
  assert.equal(env.gh.commits[0].author.email, '37198555+CodeMitVishal@users.noreply.github.com', 'no personal email');
  assert.deepEqual([...env.gh.authHeaders], ['Bearer test-token']);

  const files = env.gh.current();
  assert.equal(files.get('README.md'), '# data only', 'other files in the data repo are kept');
  assert.ok(files.has('data/history.json'));
  assert.ok(files.has('feeds/all.xml') && files.has('feeds/zoom.xml'));

  // The website can read what the cloud wrote.
  const snap = normalizeSnapshot(JSON.parse(files.get('data/status.json')));
  assert.equal(snap.services.length, catalog.length);
  const state = Object.fromEntries(snap.services.map((s) => [s.id, s.state]));
  assert.equal(state.zoom, 'maint');
  assert.equal(state.cloudflare, 'minor');
  assert.equal(state.snowflake, 'down');
  assert.equal(state.aws, 'ok', 'UTF-16 big-endian AWS feed decoded');
  assert.equal(state.teams, 'unknown');
  assert.ok(env.logs.some((l) => l.startsWith('Published 43 services')), env.logs.join('\n'));
});

test('second run loads the history it saved and records state changes', async () => {
  const env = createSandbox();
  await env.run();
  const first = JSON.parse(env.gh.current().get('data/history.json'));
  assert.equal(first.zoom.state, 'maint');
  await env.run();
  assert.equal(env.gh.commits.length, 2);
  assert.deepEqual(JSON.parse(env.gh.current().get('data/history.json')), first, 'unchanged states → same history');
});

test('redirects are followed (and checked) by hand', async () => {
  const env = createSandbox({ redirectFirst: true });
  await env.run();
  assert.ok(env.fetched.includes('https://www.githubstatus.com/api/v2/summary.json?moved=1'));
  const snap = JSON.parse(env.gh.current().get('data/status.json'));
  assert.equal(snap.services.find((s) => s.id === 'github').state, 'ok');
});

test('setup() installs exactly one 15-minute timer; teardown() removes it', () => {
  const env = createSandbox();
  vm.runInContext('setup(); setup();', env.sandbox);
  assert.deepEqual(env.triggers, [{ fn: 'run', m: 15 }]);
  vm.runInContext('teardown()', env.sandbox);
  assert.deepEqual(env.triggers, []);
});

test('missing token fails loudly without contacting anyone', async () => {
  const env = createSandbox({ token: null });
  await assert.rejects(env.run(), /GITHUB_TOKEN/);
  assert.equal(env.fetched.length, 0);
});

test('the Apps Script manifest asks only for the two permissions it needs', () => {
  const manifest = JSON.parse(readFileSync(path.join(ROOT, 'cloud/apps-script/appsscript.json'), 'utf8'));
  assert.equal(manifest.runtimeVersion, 'V8');
  assert.deepEqual(manifest.oauthScopes.sort(), [
    'https://www.googleapis.com/auth/script.external_request',
    'https://www.googleapis.com/auth/script.scriptapp',
  ]);
});

test('the bundle avoids APIs that Apps Script does not have', () => {
  const code = buildBundle();
  for (const api of ['new URL(', 'URLSearchParams', 'TextDecoder', 'AbortSignal', 'structuredClone', 'Object.hasOwn(', 'process.', 'require(', "from 'node:", 'setTimeout']) {
    assert.ok(!code.includes(api), `Code.gs uses ${api}`);
  }
  assert.ok(!/(^|[^.\w])fetch\(/m.test(code), 'Code.gs uses the browser/Node fetch() — use UrlFetchApp.fetch');
  assert.ok(!/^\s*(import|export)\s/m.test(code), 'no ES module syntax');
});

test('the cloud updater can only ever write to the data-only repository', () => {
  const code = buildBundle();
  const repos = [...code.matchAll(/repo: '([^']+)'/g)].map((m) => m[1]);
  assert.deepEqual(repos, ['CodeMitVishal/is-it-just-me-data']);
  assert.ok(!/api\.github\.com\/repos\/CodeMitVishal\/is-it-just-me[^-]/.test(code), 'never addresses the website repo');
});
