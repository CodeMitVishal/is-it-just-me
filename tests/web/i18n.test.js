// Translations: same keys in every language, correct plurals and relative times.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { ROOT } from '../helpers.js';
import { createI18n, LOCALES } from '../../web/js/i18n/i18n.js';
import { PREFERENCE_OPTIONS } from '../../web/js/application/preferences.js';

test('every language has exactly the same keys as English', () => {
  const en = Object.keys(LOCALES.en).sort();
  for (const [lang, dict] of Object.entries(LOCALES)) assert.deepEqual(Object.keys(dict).sort(), en, `${lang} keys differ`);
});

test('every data-i18n key used in index.html exists', () => {
  const html = readFileSync(path.join(ROOT, 'web/index.html'), 'utf8');
  const keys = [...html.matchAll(/data-i18n(?:-ph|-aria)?="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(keys.length > 30);
  for (const k of keys) assert.ok(k in LOCALES.en, `missing key "${k}"`);
});

test('language lists agree: locales = preferences = boot script', () => {
  assert.deepEqual(Object.keys(LOCALES).sort(), [...PREFERENCE_OPTIONS.lang].sort());
  const boot = readFileSync(path.join(ROOT, 'web/js/boot/preferences-boot.js'), 'utf8');
  for (const [name, values] of Object.entries(PREFERENCE_OPTIONS)) {
    assert.ok(boot.includes(`${name}: [${values.map((v) => `'${v}'`).join(', ')}]`), `boot script ${name} list out of sync`);
  }
});

test('plurals in English, German and Hindi', () => {
  const en = createI18n('en');
  assert.equal(en.t('hlProblems', { n: 1 }), '1 tool has problems right now.');
  assert.equal(en.t('hlProblems', { n: 4 }), '4 tools have problems right now.');
  assert.equal(createI18n('de').t('hlProblems', { n: 1 }), '1 Tool hat gerade Probleme.');
  assert.equal(createI18n('de').t('hlProblems', { n: 3 }), '3 Tools haben gerade Probleme.');
  assert.equal(createI18n('hi').t('hlProblems', { n: 2 }), 'अभी 2 टूल्स में दिक्कत है।');
});

test('relative time is localised by Intl', () => {
  const now = new Date('2026-11-21T12:00:00Z');
  assert.equal(createI18n('de').relativeTime('2026-11-21T11:55:00Z', now), 'vor 5 Minuten');
  assert.equal(createI18n('en').relativeTime('2026-11-21T10:00:00Z', now), '2 hours ago');
  assert.equal(createI18n('en').relativeTime('2026-11-21T11:59:40Z', now), 'just now');
});

test('unknown language falls back to English; missing key returns the key', () => {
  const i18n = createI18n('fr');
  assert.equal(i18n.lang, 'en');
  assert.equal(i18n.t('no-such-key'), 'no-such-key');
  i18n.setLang('hi');
  assert.equal(i18n.t('stDown'), 'बंद है');
});
