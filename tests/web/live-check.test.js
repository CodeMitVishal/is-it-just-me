// "Check live now": browser-side parsers and the use case that merges live results.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fixtureJson, svc } from '../helpers.js';
import { LIVE_PARSERS, LIVE_KINDS } from '../../web/js/domain/live-parsers.js';
import { checkLive } from '../../web/js/application/live-check.js';
import { normalizeSnapshot } from '../../web/js/domain/snapshot.js';
import { BROWSER_READABLE_KINDS } from '../../collector/domain/snapshot.js';

test('browser parsers cover exactly the formats the collector marks as browser-readable', () => {
  assert.deepEqual([...LIVE_KINDS].sort(), [...BROWSER_READABLE_KINDS].sort());
});

test('statuspage parser matches real saved responses', () => {
  assert.equal(LIVE_PARSERS.statuspage(fixtureJson('statuspage-ok.json')).state, 'ok');
  assert.equal(LIVE_PARSERS.statuspage(fixtureJson('statuspage-minor.json')).state, 'minor');
  assert.equal(LIVE_PARSERS.statuspage(fixtureJson('statuspage-down.json')).state, 'down');
  assert.equal(LIVE_PARSERS.statuspage(fixtureJson('statuspage-maint.json')).state, 'maint');
  assert.ok(!LIVE_PARSERS.statuspage(fixtureJson('statuspage-down.json')).details.some((d) => /^INC\d+/.test(d)));
});

test('other browser parsers on saved responses', () => {
  assert.equal(LIVE_PARSERS.azdo(fixtureJson('azdo-ok.json')).state, 'ok');
  assert.equal(LIVE_PARSERS.slack(fixtureJson('slack-ok.json')).state, 'ok');
  assert.equal(LIVE_PARSERS.statusio(fixtureJson('statusio-ok.json')).state, 'ok');
  assert.equal(LIVE_PARSERS.gcpjson(fixtureJson('gcp-history.json')).state, 'ok');
  assert.equal(LIVE_PARSERS.slack({ active_incidents: [{ type: 'outage', title: 'Down' }] }).state, 'down');
  assert.throws(() => LIVE_PARSERS.statuspage({ status: { indicator: '??' } }));
});

test('normalizeSnapshot keeps only safe live info', () => {
  const snap = normalizeSnapshot({
    generatedAt: '2026-11-21T10:00:00Z',
    services: [
      { id: 'a', name: 'A', live: { kind: 'statuspage', url: 'https://a.example/api/v2/summary.json' } },
      { id: 'b', name: 'B', live: { kind: 'evil', url: 'https://b.example/' } },
      { id: 'c', name: 'C', live: { kind: 'statuspage', url: 'http://c.example/' } },
    ],
  });
  assert.deepEqual(snap.services.map((s) => s.live?.kind ?? null), ['statuspage', null, null]);
});

test('checkLive updates what it can read and keeps the rest', async () => {
  const snapshot = {
    generatedAt: '2026-11-21T10:00:00Z',
    services: [
      svc({ id: 'up', state: 'down', since: '2026-11-21T09:00:00Z', live: { kind: 'statuspage', url: 'https://up/' } }),
      svc({ id: 'same', state: 'ok', since: '2026-11-20T09:00:00Z', live: { kind: 'statuspage', url: 'https://same/' } }),
      svc({ id: 'blocked', state: 'minor', live: { kind: 'statuspage', url: 'https://blocked/' } }),
      svc({ id: 'aws', state: 'ok', live: null }),
    ],
  };
  const responses = { 'https://up/': { status: { indicator: 'none' } }, 'https://same/': { status: { indicator: 'none' } } };
  const source = { fetchJson: async (url) => { if (!responses[url]) throw new Error('CORS'); return responses[url]; } };

  const { snapshot: next, checked, total } = await checkLive(snapshot, source, () => new Date('2026-11-21T12:00:00Z'));
  assert.equal(total, 3);
  assert.equal(checked, 2);
  assert.equal(next.liveCheckedAt, '2026-11-21T12:00:00.000Z');
  const byId = Object.fromEntries(next.services.map((s) => [s.id, s]));
  assert.equal(byId.up.state, 'ok');
  assert.equal(byId.up.since, null, 'state changed → old "since" no longer true');
  assert.equal(byId.same.since, '2026-11-20T09:00:00Z', 'unchanged state keeps its "since"');
  assert.equal(byId.blocked.state, 'minor', 'unreadable → keeps the collected value');
  assert.equal(byId.blocked.checkedLive, undefined);
  assert.equal(snapshot.services[0].state, 'down', 'input not mutated');
});
