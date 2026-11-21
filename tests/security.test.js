// Security, privacy and compliance rules that must never regress.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { ROOT } from './helpers.js';

const read = (p) => readFileSync(path.join(ROOT, p), 'utf8');
const PAGES = ['web/index.html', 'web/privacy.html'];
const cspOf = (html) => (html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/) || [])[1] ?? '';

test('every page has a strict CSP: same-origin only, no inline code, no framing of others', () => {
  for (const page of PAGES) {
    const csp = cspOf(read(page));
    assert.ok(csp, `${page}: CSP missing`);
    for (const rule of ["default-src 'self'", "script-src 'self'", "style-src 'self'", "object-src 'none'", "base-uri 'self'", "form-action 'none'", "frame-src 'none'"]) {
      assert.ok(csp.includes(rule), `${page}: CSP lacks ${rule}`);
    }
    assert.ok(!/unsafe-|https?:|data:|\*/.test(csp), `${page}: CSP allows something external or unsafe: ${csp}`);
  }
});

test("browsers connect only to this site: they never contact the status providers", () => {
  for (const page of PAGES) assert.match(cspOf(read(page)), /connect-src 'self';/, `${page}: connect-src must be 'self' only`);
  const offenders = [];
  const walk = (dir) => readdirSync(dir, { withFileTypes: true }).forEach((d) => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) walk(p);
    else if (p.endsWith('.js') && /fetch\(\s*['"`]https?:/.test(readFileSync(p, 'utf8'))) offenders.push(p);
  });
  walk(path.join(ROOT, 'web/js'));
  assert.deepEqual(offenders, [], 'web code must not fetch absolute URLs');
});

test('status is read through the GitHub Pages cache (no cache-busting), so all visitors share one copy', () => {
  const src = read('web/js/infrastructure/status-source.js');
  assert.ok(!/Date\.now\(\)|\?t=|no-store|reload/.test(src), 'status-source must not bypass the cache');
  const minutes = Number((read('web/js/main.js').match(/const REFRESH_MS = (\d+) \* 60_000/) || [])[1]);
  assert.ok(minutes >= 5, 'refresh at most every 5 minutes (the CDN caches for ~10)');
});

test('no inline scripts, inline styles or third-party resources in the HTML', () => {
  for (const page of PAGES) {
    const html = read(page);
    assert.ok(!/<script(?![^>]*\bsrc=)[^>]*>/.test(html), `${page}: inline <script>`);
    assert.ok(!/\sstyle="/.test(html), `${page}: inline style attribute`);
    assert.ok(!/<(script|link|img)[^>]+(src|href)="https?:/.test(html), `${page}: loads a third-party resource`);
    assert.ok(/<meta name="referrer" content="no-referrer">/.test(html), `${page}: referrer policy missing`);
  }
});

test('external links never leak the opener', () => {
  for (const page of PAGES) {
    for (const [tag] of read(page).matchAll(/<a\b[^>]*href="https:[^"]*"[^>]*>/g)) {
      assert.match(tag, /rel="noopener noreferrer"/, `${page}: ${tag}`);
    }
  }
});

test('privacy page exists, is linked from the home page, and covers the GDPR essentials', () => {
  const home = read('web/index.html');
  assert.match(home, /href="privacy.html"/);
  const privacy = read('web/privacy.html');
  for (const must of ['Art. 6(1)(f) GDPR', 'TDDDG', 'Art. 77', 'lastSeen', 'Data Privacy Framework', 'trademark', 'WCAG']) {
    assert.ok(privacy.includes(must), `privacy page lacks "${must}"`);
  }
  assert.match(privacy, /<article id="de" lang="de">/, 'German version present');
});

test('every localStorage key used by the app is disclosed on the privacy page', () => {
  const privacy = read('web/privacy.html');
  const keys = new Set();
  const walk = (dir) => readdirSync(dir, { withFileTypes: true }).forEach((d) => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) walk(p);
    else if (p.endsWith('.js')) for (const m of readFileSync(p, 'utf8').matchAll(/const KEY = '([a-zA-Z]+)'/g)) keys.add(m[1]);
  });
  walk(path.join(ROOT, 'web/js'));
  ['theme', 'font', 'lang'].forEach((k) => keys.add(k));
  for (const k of keys) assert.ok(privacy.includes(`<code>${k}</code>`), `key "${k}" not disclosed`);
});

test('every icon referenced in config exists and is a real image', () => {
  const services = JSON.parse(read('config/services.json'));
  for (const s of services.filter((x) => x.icon)) {
    const file = path.join(ROOT, 'web', s.icon);
    assert.ok(existsSync(file), `${s.id}: ${s.icon} missing`);
    const b = readFileSync(file);
    const ok = (b[0] === 0x89 && b[1] === 0x50) || (b[0] === 0 && b[1] === 0 && b[2] === 1) || (b[0] === 0xff && b[1] === 0xd8)
      || b.subarray(8, 12).toString() === 'WEBP' || /<svg/i.test(b.subarray(0, 500).toString());
    assert.ok(ok, `${s.id}: not a recognised image`);
  }
});

test('security.txt is present and not expired', () => {
  const txt = read('web/.well-known/security.txt');
  assert.match(txt, /^Contact: https:\/\//m);
  const expires = Date.parse((txt.match(/^Expires: (.+)$/m) || [])[1]);
  assert.ok(expires > Date.now(), 'security.txt has expired — update the Expires line');
});

test('workflow uses least privilege and pinned actions', () => {
  const wf = read('.github/workflows/status.yml');
  assert.match(wf, /^permissions: \{\}$/m, 'default permissions must be empty');
  assert.ok(!wf.includes('pull_request_target'));
  for (const [, ref] of wf.matchAll(/uses: [^@\s]+@(\S+)/g)) assert.match(ref, /^[0-9a-f]{40}$/, `action not pinned to a SHA: ${ref}`);
});

test('status data is read from the same origin (data-only repo on the same GitHub Pages domain)', () => {
  const config = read('web/js/config.js');
  const bases = [...config.matchAll(/'(\.\/|\/[^']*\/)'/g)].map((m) => m[1]);
  assert.deepEqual(bases, ['./', '/is-it-just-me-data/'], 'DATA_BASE must be a same-origin path, never a full URL');
  assert.ok(!/https?:\/\//.test(config.replace(/\/\/.*$/gm, '')), 'no absolute URLs in config.js code');
});
