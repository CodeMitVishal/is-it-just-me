// ===================================================================================
// Apps Script runtime: infrastructure + composition root for the cloud updater.
// The collector's domain, use case and provider adapters are bundled above this part
// (see tools/build-apps-script.js) — the same code that runs in Node, unchanged.
//
// Every 15 minutes (time-driven trigger) it:
//   1. reads all public status pages ONCE (UrlFetchApp, on Google's servers)
//   2. updates the change history
//   3. writes data/status.json, data/history.json and feeds/*.xml to the DATA-ONLY repo
//      (is-it-just-me-data) in ONE commit through the GitHub API → GitHub Pages serves it
//      to every visitor. The token can write only there, never to the website's code.
//
// Setup: put a fine-grained GitHub token (ONLY is-it-just-me-data, "Contents: Read and write") in
// Project Settings → Script properties as GITHUB_TOKEN, then run setup() once.
// ===================================================================================

const CONFIG = Object.freeze({
  repo: 'CodeMitVishal/is-it-just-me-data', // data only — never the website's code repo
  branch: 'main',
  siteUrl: 'https://codemitvishal.github.io/is-it-just-me-data/', // where data/ and feeds/ are served
  everyMinutes: 15, // Apps Script allows 1, 5, 10, 15 or 30
  maxBytes: 8 * 1024 * 1024,
  maxRedirects: 3,
  // Commits are attributed to a bot name with GitHub's private noreply address (no personal email).
  author: { name: 'is-it-just-me bot', email: '37198555+CodeMitVishal@users.noreply.github.com' },
});

// ---------- Entry points (run these from the Apps Script editor) ----------

/** One update. Called by the timer every 15 minutes; you can also run it by hand. */
async function run() {
  const token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  if (!token) throw new Error('Missing script property GITHUB_TOKEN (Project Settings → Script properties).');

  const { validateCatalog } = __modules['collector/domain/catalog.js'];
  const { collectStatuses } = __modules['collector/application/collect-statuses.js'];
  const { createAdapterRegistry } = __modules['collector/adapters/providers/index.js'];

  const adapters = createAdapterRegistry();
  const catalog = validateCatalog(CATALOG, { knownKinds: [...adapters.keys()] });
  const site = createGitHubSite(createGitHubApi(token));

  const snapshot = await collectStatuses({
    catalog,
    adapters,
    http: createGasHttpClient(),
    historyStore: site.historyStore,
    publishers: [site.publisher],
    logger: { info: (m) => console.log(m), warn: (m) => console.warn(m) },
  });
  console.log(`Published ${snapshot.services.length} services at ${snapshot.generatedAt} → ${CONFIG.siteUrl}`);
  return snapshot.generatedAt;
}

/** Run once: installs the 15-minute timer (removes any older timer first). */
function setup() {
  teardown();
  ScriptApp.newTrigger('run').timeBased().everyMinutes(CONFIG.everyMinutes).create();
  console.log(`Timer installed: run() every ${CONFIG.everyMinutes} minutes.`);
}

/** Stops the automatic updates. */
function teardown() {
  for (const trigger of ScriptApp.getProjectTriggers()) {
    if (trigger.getHandlerFunction() === 'run') ScriptApp.deleteTrigger(trigger);
  }
}

// ---------- HttpClient port (UrlFetchApp) ----------

function createGasHttpClient() {
  function text(url) {
    let current = url;
    for (let hop = 0; hop <= CONFIG.maxRedirects; hop++) {
      if (!/^https:\/\//.test(current)) throw new Error('https only');
      const res = UrlFetchApp.fetch(current, {
        muteHttpExceptions: true,
        followRedirects: false, // followed by hand so every hop is checked for https
        headers: { Accept: 'application/json, application/rss+xml, */*' },
      });
      const code = res.getResponseCode();
      if (code >= 300 && code < 400) {
        const headers = res.getHeaders();
        const location = headers.Location || headers.location;
        if (!location) throw new Error(`HTTP ${code} without Location`);
        current = resolveLocation(location, current);
        continue;
      }
      if (code < 200 || code >= 300) throw new Error(`HTTP ${code}`);
      const bytes = res.getContent();
      if (bytes.length > CONFIG.maxBytes) throw new Error('response too large');
      return decodeGasBytes(bytes);
    }
    throw new Error('too many redirects');
  }
  return {
    text: async (url) => text(url),
    json: async (url) => JSON.parse(text(url)),
  };
}

/** Resolves a redirect Location (Apps Script has no URL class). */
function resolveLocation(location, from) {
  if (/^[a-z][a-z0-9+.-]*:/i.test(location)) return location;                          // absolute
  const origin = from.match(/^[a-z]+:\/\/[^/]+/i)[0];
  if (location.startsWith('//')) return from.split(':')[0] + ':' + location;             // protocol-relative
  if (location.startsWith('/')) return origin + location;                               // root-relative
  return from.replace(/[?#].*$/, '').replace(/[^/]*$/, '') + location;                  // path-relative
}

/** UTF-8, or UTF-16 with a byte-order mark (AWS). Apps Script bytes are signed (-128..127). */
function decodeGasBytes(bytes) {
  const b0 = bytes[0] & 255;
  const b1 = bytes[1] & 255;
  const charset = b0 === 0xfe && b1 === 0xff ? 'UTF-16BE' : b0 === 0xff && b1 === 0xfe ? 'UTF-16LE' : 'UTF-8';
  return Utilities.newBlob(bytes).getDataAsString(charset).replace(/^﻿/, '');
}

// ---------- GitHub API (HistoryStore + Publisher ports) ----------

function createGitHubApi(token) {
  return function api(method, path, body) {
    const res = UrlFetchApp.fetch(`https://api.github.com/repos/${CONFIG.repo}${path}`, {
      method,
      muteHttpExceptions: true,
      contentType: 'application/json',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
      ...(body ? { payload: JSON.stringify(body) } : {}),
    });
    const code = res.getResponseCode();
    if (code >= 300) {
      const error = new Error(`GitHub ${method.toUpperCase()} ${path} → ${code}`);
      error.status = code;
      throw error;
    }
    const text = res.getContentText();
    return text ? JSON.parse(text) : null;
  };
}

/**
 * History lives in the data repo (data/history.json). Everything changed in one run is written in
 * a single commit. The commit has no parent and the branch is force-updated, so the data branch always
 * holds exactly one commit and the repository never grows.
 */
function createGitHubSite(api) {
  const pending = new Map();

  function readText(path) {
    const file = api('get', `/contents/${path}?ref=${CONFIG.branch}`);
    return Utilities.newBlob(Utilities.base64Decode(file.content)).getDataAsString('UTF-8');
  }

  function commitAll(message) {
    const ref = api('get', `/git/ref/heads/${CONFIG.branch}`);
    const head = api('get', `/git/commits/${ref.object.sha}`);
    const tree = api('post', '/git/trees', {
      base_tree: head.tree.sha, // keep the other files in the data repo (README, .nojekyll)
      tree: [...pending].map(([path, content]) => ({ path, mode: '100644', type: 'blob', content })),
    });
    const stamp = { ...CONFIG.author, date: new Date().toISOString() };
    const commit = api('post', '/git/commits', { message, tree: tree.sha, parents: [], author: stamp, committer: stamp });
    api('patch', `/git/refs/heads/${CONFIG.branch}`, { sha: commit.sha, force: true });
    pending.clear();
  }

  return {
    historyStore: {
      async load() {
        try { return JSON.parse(readText('data/history.json')); } catch (e) { if (e.status === 404) return {}; throw e; }
      },
      async save(history) {
        pending.set('data/history.json', JSON.stringify(history, null, 1) + '\n');
      },
    },
    publisher: {
      async publish(snapshot, history) {
        const { buildFeeds } = __modules['collector/domain/feeds.js'];
        pending.set('data/status.json', JSON.stringify(snapshot));
        for (const file of buildFeeds(snapshot, history, CONFIG.siteUrl)) pending.set(file.path, file.content);
        commitAll(`Update status ${snapshot.generatedAt}`);
      },
    },
  };
}
