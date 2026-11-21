// Security, privacy and compliance rules that must never regress.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { ROOT } from './helpers.js';

const read = (p) => readFileSync(path.join(ROOT, p), 'utf8');
const PAGES = ['web/index.html', 'web/privacy.html'];
const cspOf = (html) => (html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/) || [])[1] ?? '';

test('every page has a strict CSP: same-origin code, no inline code, no framing of others', () => {
  for (const page of PAGES) {
    const csp = cspOf(read(page));
    assert.ok(csp, `${page}: CSP missing`);
    for (const rule of ["default-src 'self'", "script-src 'self'", "style-src 'self'", "img-src 'self'", "object-src 'none'", "base-uri 'self'", "form-action 'none'", "frame-src 'none'"]) {
      assert.ok(csp.includes(rule), `${page}: CSP lacks ${rule}`);
    }
    // Only connect-src may name other hosts (the live-check allow-list); everything else stays same-origin.
    const rest = csp.replace(/connect-src[^;]*;/, '');
    assert.ok(!/unsafe-|https?:|data:|\*/.test(rest), `${page}: CSP allows something external or unsafe: ${csp}`);
  }
});

test('connect-src allows exactly the status feeds in catalog.json — no wildcards', () => {
  const catalog = JSON.parse(read('web/catalog.json'));
  const expected = [...new Set(catalog.services.filter((s) => s.live).map((s) => `https://${new URL(s.live.url).host}`))].sort();
  const connect = (cspOf(read('web/index.html')).match(/connect-src ([^;]+)/) || [])[1].trim().split(/\s+/);
  assert.equal(connect[0], "'self'");
  assert.deepEqual(connect.slice(1).sort(), expected, 'update connect-src in web/index.html to match web/catalog.json');
  assert.ok(!connect.some((h) => h.includes('*') || h === 'https:' || h.startsWith('http:')), 'no wildcards, https only');
  assert.match(cspOf(read('web/privacy.html')), /connect-src 'self';/, 'the privacy page contacts nobody');
});

test('live checks run only with consent and only through the scheduler', () => {
  const main = read('web/js/main.js');
  assert.equal((main.match(/checkLive\(/g) || []).length, 1, 'checkLive is called in exactly one place');
  assert.match(main, /run: runLiveCheck/, 'runLiveCheck is only triggered by createLiveUpdates (which checks consent)');
  assert.ok(!/(?<!function )runLiveCheck\(/.test(main), 'runLiveCheck must never be called directly');
  assert.match(read('web/js/application/live-updates.js'), /if \(!consent\.isGranted\(\)/, 'the scheduler refuses without consent');
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

test('live requests send no cookies and no referrer', () => {
  const src = read('web/js/infrastructure/live-source.js');
  assert.match(src, /credentials: 'omit'/);
  assert.match(src, /referrerPolicy: 'no-referrer'/);
  assert.match(src, /startsWith\('https:\/\/'\)/);
});

test('external links never leak the opener', () => {
  for (const page of PAGES) {
    for (const [tag] of read(page).matchAll(/<a\b[^>]*href="https:[^"]*"[^>]*>/g)) {
      assert.match(tag, /rel="noopener noreferrer"/, `${page}: ${tag}`);
    }
  }
});

test('privacy page covers the GDPR essentials, including consent for live checks (EN + DE)', () => {
  assert.match(read('web/index.html'), /href="privacy.html"/);
  const privacy = read('web/privacy.html');
  for (const must of ['Art. 6(1)(f) GDPR', 'Art. 6(1)(a) GDPR', '§ 25(1) TDDDG', 'Art. 77', 'Data Privacy Framework', 'trademark', 'WCAG',
    'Allow live checks', 'Display → Live checks → Off', 'Live-Prüfung erlauben', 'Anzeige → Live-Prüfung → Aus']) {
    assert.ok(privacy.includes(must), `privacy page lacks "${must}"`);
  }
  assert.match(privacy, /<article id="de" lang="de">/, 'German version present');
});

test('every localStorage key used by the app is disclosed on the privacy page', () => {
  const privacy = read('web/privacy.html');
  const keys = new Set(['theme', 'font', 'lang']);
  const walk = (dir) => readdirSync(dir, { withFileTypes: true }).forEach((d) => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) walk(p);
    else if (p.endsWith('.js')) for (const m of readFileSync(p, 'utf8').matchAll(/const KEY = '([a-zA-Z]+)'/g)) keys.add(m[1]);
  });
  walk(path.join(ROOT, 'web/js'));
  assert.ok(keys.has('liveConsent'));
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

test('no secrets or tokens anywhere in the repository files', () => {
  const SECRET = /(ghp_|gho_|ghu_|ghs_|ghr_)[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,}|AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{35}|-----BEGIN [A-Z ]*PRIVATE KEY/;
  const hits = [];
  const walk = (dir) => readdirSync(dir, { withFileTypes: true }).forEach((d) => {
    if (['.git', 'node_modules', 'fixtures', 'fonts', 'icons'].includes(d.name)) return;
    const p = path.join(dir, d.name);
    if (d.isDirectory()) walk(p);
    else if (SECRET.test(readFileSync(p, 'utf8'))) hits.push(path.relative(ROOT, p));
  });
  walk(ROOT);
  assert.deepEqual(hits, []);
});
