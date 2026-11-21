// Architecture rules (the "onion"): inner layers must never depend on outer ones.
// domain  ←  application  ←  adapters / infrastructure / i18n / ui  ←  main.js
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
/** Local imports, resolved to absolute paths (built-ins like node:fs are skipped). */
const importsOf = (file) => specifiersOf(file).filter((s) => s.startsWith('.')).map((s) => path.resolve(path.dirname(file), s));
const rel = (p) => path.relative(ROOT, p).replaceAll('\\', '/');
const layerOf = (p) => rel(p).split('/').slice(0, -1).join('/');

/** For each layer: the folders it may import from. */
const ALLOWED = {
  'collector/domain': ['collector/domain'],
  'collector/application': ['collector/domain', 'collector/application'],
  'collector/adapters/providers': ['collector/domain', 'collector/application', 'collector/adapters/providers'],
  'collector/infrastructure': ['collector/domain', 'collector/application', 'collector/infrastructure'],
  'web/js/domain': ['web/js/domain'],
  'web/js/application': ['web/js/domain', 'web/js/application'],
  'web/js/infrastructure': ['web/js/application', 'web/js/infrastructure'],
  'web/js/i18n': ['web/js/i18n', 'web/js/i18n/locales'],
};

test('layers only import from allowed layers', () => {
  const problems = [];
  for (const file of [...files(path.join(ROOT, 'collector')), ...files(path.join(ROOT, 'web/js'))]) {
    const allowed = ALLOWED[layerOf(file)];
    if (!allowed) continue; // composition roots and UI may use everything below them
    for (const target of importsOf(file)) {
      if (!allowed.includes(layerOf(target))) problems.push(`${rel(file)} → ${rel(target)}`);
    }
    // Node built-ins (file system, etc.) belong in infrastructure only.
    if (!layerOf(file).endsWith('infrastructure') && specifiersOf(file).some((s) => s.startsWith('node:'))) problems.push(`${rel(file)} uses node: built-ins`);
  }
  assert.deepEqual(problems, []);
});

test('collector and website share no code (they meet only at status.json)', () => {
  const crossing = [...files(path.join(ROOT, 'collector')), ...files(path.join(ROOT, 'web/js'))]
    .flatMap((f) => importsOf(f).map((t) => [rel(f).split('/')[0], rel(t).split('/')[0], rel(f)]))
    .filter(([from, to]) => from !== to)
    .map(([, , f]) => f);
  assert.deepEqual(crossing, []);
});

test('web domain and application never touch browser APIs', () => {
  const BROWSER = /\b(window|document|localStorage|fetch|Notification|navigator)\b/;
  const offenders = ['web/js/domain', 'web/js/application']
    .flatMap((d) => files(path.join(ROOT, d)))
    .filter((f) => BROWSER.test(readFileSync(f, 'utf8').replace(/\/\/.*$|\/\*[\s\S]*?\*\//gm, '')))
    .map(rel);
  assert.deepEqual(offenders, []);
});

test('collector domain and application do no I/O', () => {
  const IO = /from 'node:|\bfetch\(|process\./;
  const offenders = ['collector/domain', 'collector/application']
    .flatMap((d) => files(path.join(ROOT, d)))
    .filter((f) => IO.test(readFileSync(f, 'utf8')))
    .map(rel);
  assert.deepEqual(offenders, []);
});

test('UI never uses innerHTML (all text goes in via textContent)', () => {
  const offenders = files(path.join(ROOT, 'web/js')).filter((f) => /\.(inner|outer)HTML\s*=|insertAdjacentHTML/.test(readFileSync(f, 'utf8'))).map(rel);
  assert.deepEqual(offenders, []);
});
