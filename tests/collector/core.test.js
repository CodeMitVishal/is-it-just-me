// Collector domain + use case + infrastructure helpers.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { ROOT } from '../helpers.js';
import { createReading, worse } from '../../collector/domain/status.js';
import { applyReadings, observedSince } from '../../collector/domain/history.js';
import { validateCatalog } from '../../collector/domain/catalog.js';
import { collectStatuses } from '../../collector/application/collect-statuses.js';
import { createAdapterRegistry } from '../../collector/adapters/providers/index.js';
import { createHttpClient, decodeBytes } from '../../collector/infrastructure/http-client.js';
import { renderAtom, buildFeeds } from '../../collector/domain/feeds.js';

const T0 = new Date('2026-11-21T10:00:00Z');
const T1 = new Date('2026-11-21T10:10:00Z');
const reading = (state, details = []) => createReading({ state, details });

test('status: worse() and readings', () => {
  assert.equal(worse('ok', 'minor'), 'minor');
  assert.equal(worse('down', 'minor'), 'down');
  assert.deepEqual(reading('ok', ['ignored']).details, [], 'working services carry no details');
  assert.throws(() => createReading({ state: 'broken' }));
});

test('history: first sighting records state but no event, and no "since"', () => {
  const { history, changed } = applyReadings({}, [{ id: 'a', reading: reading('ok') }], T0);
  assert.equal(changed, true);
  assert.deepEqual(history.a.events, []);
  assert.equal(observedSince(history.a), undefined);
});

test('history: a change adds an event and sets "since"', () => {
  const first = applyReadings({}, [{ id: 'a', reading: reading('ok') }], T0).history;
  const { history, changed } = applyReadings(first, [{ id: 'a', reading: reading('down', ['Outage']) }], T1);
  assert.equal(changed, true);
  assert.deepEqual(history.a.events[0], { t: T1.toISOString(), state: 'down', text: 'Outage' });
  assert.equal(observedSince(history.a), T1.toISOString());
  assert.equal(first.a.state, 'ok', 'input history is not mutated');
});

test('history: unknown readings and unchanged states change nothing', () => {
  const first = applyReadings({}, [{ id: 'a', reading: reading('ok') }], T0).history;
  const r = applyReadings(first, [{ id: 'a', reading: createReading({ state: 'unknown' }) }, { id: 'b', reading: createReading({ state: 'unknown' }) }], T1);
  assert.equal(r.changed, false);
  assert.equal(applyReadings(first, [{ id: 'a', reading: reading('ok') }], T1).changed, false);
});

test('catalog: the real config/services.json is valid', () => {
  const entries = JSON.parse(readFileSync(path.join(ROOT, 'config/services.json'), 'utf8'));
  assert.ok(validateCatalog(entries, { knownKinds: [...createAdapterRegistry().keys()] }).length >= 40);
});

test('catalog: rejects bad entries with a clear message', () => {
  const ok = { id: 'a', name: 'A', cat: 'dev', kind: 'statuspage', url: 'https://a/x', page: 'https://a/' };
  const opts = { knownKinds: ['statuspage', 'none'] };
  assert.throws(() => validateCatalog([{ ...ok, id: 'Bad ID' }], opts), /id must match/);
  assert.throws(() => validateCatalog([ok, ok], opts), /duplicate/);
  assert.throws(() => validateCatalog([{ ...ok, url: 'http://a' }], opts), /https/);
  assert.throws(() => validateCatalog([{ ...ok, kind: 'nope' }], opts), /unknown kind/);
  assert.throws(() => validateCatalog([{ ...ok, cat: 'misc' }], opts), /cat must be/);
});

test('use case: a failing provider becomes "unknown"; history saved only when changed; publishers get the snapshot', async () => {
  const catalog = [
    { id: 'good', name: 'Good', cat: 'dev', kind: 'fake', url: 'https://g/', page: 'https://g/' },
    { id: 'bad', name: 'Bad', cat: 'dev', kind: 'boom', url: 'https://b/', page: 'https://b/' },
  ];
  const adapters = new Map([
    ['fake', { kind: 'fake', read: async () => reading('minor', ['Slow']) }],
    ['boom', { kind: 'boom', read: async () => { throw new Error('HTTP 500'); } }],
  ]);
  const saved = [];
  const published = [];
  const warnings = [];
  const deps = {
    catalog, adapters, http: {},
    historyStore: { load: async () => saved.at(-1) ?? {}, save: async (h) => { saved.push(h); } },
    publishers: [{ publish: async (s) => { published.push(s); } }],
    logger: { info() {}, warn: (m) => warnings.push(m) },
    clock: () => T0,
  };

  const snap = await collectStatuses(deps);
  assert.deepEqual(snap.services.map((s) => s.state), ['minor', 'unknown']);
  assert.equal(snap.generatedAt, T0.toISOString());
  assert.equal(published.length, 1);
  assert.equal(saved.length, 1);
  assert.match(warnings[0], /bad: HTTP 500/);

  await collectStatuses(deps); // same states again
  assert.equal(saved.length, 1, 'no save when nothing changed');
});

test('http client: https only, size cap, decodes UTF-16', async () => {
  const fakeFetch = (body) => async () => ({ ok: true, status: 200, url: 'https://x/', arrayBuffer: async () => body });
  await assert.rejects(createHttpClient({ fetchImpl: fakeFetch(new ArrayBuffer(1)) }).text('http://x/'), /https only/);
  await assert.rejects(createHttpClient({ maxBytes: 3, fetchImpl: fakeFetch(new ArrayBuffer(10)) }).text('https://x/'), /too large/);
  const le = Buffer.from('﻿{"a":1}', 'utf16le');
  assert.deepEqual(await createHttpClient({ fetchImpl: fakeFetch(le) }).json('https://x/'), { a: 1 });
  assert.equal(decodeBytes(new TextEncoder().encode('héllo')), 'héllo');
});

test('atom feed: escapes text and links', () => {
  const xml = renderAtom({ siteUrl: 'https://s/', id: 'a', title: 'A & B', now: T0.toISOString(), entries: [{ t: T0.toISOString(), title: '<x>', text: '"q"', link: 'https://a/?a=1&b=2' }] });
  assert.match(xml, /<title>A &amp; B<\/title>/);
  assert.match(xml, /&lt;x&gt;/);
  assert.match(xml, /a=1&amp;b=2/);
  assert.ok(!xml.includes('<x>'));
});

test('feeds: one per service plus all.xml, built from history only', () => {
  const snapshot = { generatedAt: T1.toISOString(), services: [{ id: 'a', name: 'A', page: 'https://a/' }, { id: 'b', name: 'B', page: 'https://b/' }] };
  const history = { a: { state: 'down', since: T1.toISOString(), events: [{ t: T1.toISOString(), state: 'down', text: 'Outage' }] } };
  const files = buildFeeds(snapshot, history, 'https://s/');
  assert.deepEqual(files.map((f) => f.path), ['feeds/a.xml', 'feeds/b.xml', 'feeds/all.xml']);
  assert.match(files[0].content, /<title>A: Down<\/title>/);
  assert.match(files[2].content, /Outage/);
});
