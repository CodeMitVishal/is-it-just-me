// Architecture rules (the "onion"): inner layers must never depend on outer ones.
// domain  ←  application  ←  infrastructure / i18n / ui  ←  main.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { ROOT } from './helpers.js';

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? files(full) : full.endsWith('.js') ? [full] : [];
  });
}
const specifiersOf = (file) => [...readFileSync(file, 'utf8').matchAll(/^\s*import\s[^'"]*['"]([^'"]+)['"]/gm)].map((m) => m[1]);
/** Local imports, resolved to absolute paths. */
const importsOf = (file) => specifiersOf(file).filter((s) => s.startsWith('.')).map((s) => path.resolve(path.dirname(file), s));
const rel = (p) => path.relative(ROOT, p).replaceAll('\\', '/');
const layerOf = (p) => rel(p).split('/').slice(0, -1).join('/');
const WEB = path.join(ROOT, 'web/js');

/** For each layer: the folders it may import from. */
const ALLOWED = {
  'web/js/domain': ['web/js/domain'],
  'web/js/application': ['web/js/domain', 'web/js/application'],
  'web/js/infrastructure': ['web/js/application', 'web/js/infrastructure'],
  'web/js/i18n': ['web/js/i18n', 'web/js/i18n/locales'],
};

test('layers only import from allowed layers', () => {
  const problems = [];
  for (const file of files(WEB)) {
    const allowed = ALLOWED[layerOf(file)];
    if (!allowed) continue; // the UI and the composition root may use everything below them
    for (const target of importsOf(file)) {
      if (!allowed.includes(layerOf(target))) problems.push(`${rel(file)} → ${rel(target)}`);
    }
  }
  assert.deepEqual(problems, []);
});

test('every import points to a file that exists', () => {
  const missing = files(WEB).flatMap((f) => importsOf(f).filter((t) => { try { return !statSync(t).isFile(); } catch { return true; } }).map((t) => `${rel(f)} → ${rel(t)}`));
  assert.deepEqual(missing, []);
});

test('domain and application never touch browser APIs', () => {
  const BROWSER = /\b(window|document|localStorage|fetch|Notification|navigator|location)\b/;
  const offenders = ['web/js/domain', 'web/js/application']
    .flatMap((d) => files(path.join(ROOT, d)))
    .filter((f) => BROWSER.test(readFileSync(f, 'utf8').replace(/\/\/.*$|\/\*[\s\S]*?\*\//gm, '')))
    .map(rel);
  assert.deepEqual(offenders, []);
});

test('UI never uses innerHTML (all text goes in via textContent)', () => {
  const offenders = files(WEB).filter((f) => /\.(inner|outer)HTML\s*=|insertAdjacentHTML/.test(readFileSync(f, 'utf8'))).map(rel);
  assert.deepEqual(offenders, []);
});
