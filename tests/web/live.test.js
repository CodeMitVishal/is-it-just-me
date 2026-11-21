// The browser-side live engine: catalog, parsers (on saved real responses), the check itself,
// consent, and the 5-minute scheduler.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { ROOT, fixtureJson, memoryStore, svc } from '../helpers.js';
import { LIVE_PARSERS, LIVE_KINDS } from '../../web/js/domain/live-parsers.js';
import { normalizeCatalog } from '../../web/js/domain/catalog.js';
import { checkLive } from '../../web/js/application/live-check.js';
import { createLiveConsent } from '../../web/js/application/live-consent.js';
import { createLiveUpdates, LIVE_INTERVAL_MS } from '../../web/js/application/live-updates.js';
import { BROWSER_READABLE_KINDS, catalogJson } from '../../tools/build-catalog.js';

test('web/catalog.json is up to date with config/services.json (run: npm run build:catalog)', () => {
  assert.equal(readFileSync(path.join(ROOT, 'web/catalog.json'), 'utf8'), catalogJson());
});

test('browser parsers cover exactly the formats the catalog marks as browser-readable', () => {
  assert.deepEqual([...LIVE_KINDS].sort(), [...BROWSER_READABLE_KINDS].sort());
});

test('catalog: 43 services, 36 live, AWS/Azure/Stripe blocked, 4 without a feed', () => {
  const services = normalizeCatalog(JSON.parse(readFileSync(path.join(ROOT, 'web/catalog.json'), 'utf8')));
  assert.equal(services.length, 43);
  assert.equal(services.filter((s) => s.live).length, 36);
  assert.deepEqual(services.filter((s) => s.browserBlocked).map((s) => s.id).sort(), ['aws', 'azure', 'stripe']);
  assert.equal(services.filter((s) => s.noFeed).length, 4);
  assert.ok(services.every((s) => s.state === 'unknown' && !s.checked), 'nothing is shown as working before a real check');
});

test('catalog: untrusted entries are cleaned', () => {
  const services = normalizeCatalog({ services: [
    { id: 'ok', name: 'OK', cat: 'dev', page: 'https://ok/', live: { kind: 'statuspage', url: 'https://ok/api' }, icon: 'icons/ok.png' },
    { id: 'evil', name: 'Evil', cat: 'x', page: 'javascript:alert(1)', live: { kind: 'evil', url: 'https://e/' }, icon: 'https://e/x.png' },
    { id: 'http', name: 'Http', live: { kind: 'statuspage', url: 'http://plain/' } },
    { id: '../bad', name: 'Bad' },
  ] });
  assert.deepEqual(services.map((s) => s.id), ['ok', 'evil', 'http']);
  assert.equal(services[1].page, '');
  assert.equal(services[1].icon, '');
  assert.equal(services[1].live, null);
  assert.equal(services[1].cat, 'work');
  assert.equal(services[2].live, null, 'http feeds are dropped');
});

test('parsers on saved real responses', () => {
  assert.equal(LIVE_PARSERS.statuspage(fixtureJson('statuspage-ok.json')).state, 'ok');
  assert.equal(LIVE_PARSERS.statuspage(fixtureJson('statuspage-minor.json')).state, 'minor');
  assert.equal(LIVE_PARSERS.statuspage(fixtureJson('statuspage-down.json')).state, 'down');
  assert.equal(LIVE_PARSERS.statuspage(fixtureJson('statuspage-maint.json')).state, 'maint');
  assert.ok(!LIVE_PARSERS.statuspage(fixtureJson('statuspage-down.json')).details.some((d) => /^INC\d+/.test(d)), 'bare ticket ids hidden');
  assert.equal(LIVE_PARSERS.azdo(fixtureJson('azdo-ok.json')).state, 'ok');
  assert.equal(LIVE_PARSERS.slack(fixtureJson('slack-ok.json')).state, 'ok');
  assert.equal(LIVE_PARSERS.statusio(fixtureJson('statusio-ok.json')).state, 'ok');
  assert.equal(LIVE_PARSERS.gcpjson(fixtureJson('gcp-history.json')).state, 'ok');
  assert.equal(LIVE_PARSERS.slack({ active_incidents: [{ type: 'outage', title: 'Down' }] }).state, 'down');
  assert.throws(() => LIVE_PARSERS.statuspage({ status: { indicator: '??' } }), 'unknown formats never count as working');
});

test('checkLive: reads each live service once; failures show "Can\'t check", never "working"', async () => {
  const services = [
    svc({ id: 'up', live: { kind: 'statuspage', url: 'https://up/' } }),
    svc({ id: 'down', live: { kind: 'statuspage', url: 'https://down/' } }),
    svc({ id: 'offline', state: 'ok', live: { kind: 'statuspage', url: 'https://offline/' } }),
    svc({ id: 'aws', browserBlocked: true, live: null }),
  ];
  const calls = [];
  const responses = { 'https://up/': { status: { indicator: 'none' } }, 'https://down/': { status: { indicator: 'major' }, incidents: [{ name: 'Outage' }] } };
  const source = { fetchJson: async (url) => { calls.push(url); if (!responses[url]) throw new Error('offline'); return responses[url]; } };

  const r = await checkLive(services, source, () => new Date('2026-11-21T12:00:00Z'));
  assert.deepEqual(calls.sort(), ['https://down/', 'https://offline/', 'https://up/'], 'one request per live service, none for blocked ones');
  assert.equal(r.checked, 2);
  assert.equal(r.total, 3);
  assert.equal(r.checkedAt, '2026-11-21T12:00:00.000Z');
  const by = Object.fromEntries(r.services.map((s) => [s.id, s]));
  assert.equal(by.up.state, 'ok');
  assert.deepEqual([by.down.state, by.down.details], ['down', ['Outage']]);
  assert.equal(by.offline.state, 'unknown', 'a failed read is never shown as working');
  assert.equal(by.aws.state, 'unknown');
});

test('consent: nothing until the visitor decides; the choice is remembered and can be withdrawn', () => {
  const store = memoryStore();
  const consent = createLiveConsent(store);
  assert.equal(consent.get(), null);
  assert.equal(consent.isGranted(), false);
  consent.grant();
  assert.equal(createLiveConsent(store).isGranted(), true, 'remembered on the next visit');
  consent.deny();
  assert.equal(createLiveConsent(store).get(), 'denied');
  assert.equal(createLiveConsent(memoryStore({ liveConsent: 'hacked' })).get(), null, 'unknown values are ignored');
});

test('scheduler: runs only with consent, only when visible, at most every 5 minutes, never twice at once', async () => {
  let t = 0;
  let runs = 0;
  let visible = true;
  const consent = createLiveConsent(memoryStore());
  const updates = createLiveUpdates({ consent, isVisible: () => visible, now: () => t, run: async () => { runs++; } });

  assert.equal(await updates.tick(true), false, 'no consent → no request at all');
  consent.grant();
  assert.equal(await updates.tick(true), true, 'first load runs right away');
  t += LIVE_INTERVAL_MS - 1;
  assert.equal(await updates.tick(), false, 'not yet 5 minutes');
  t += 1;
  visible = false;
  assert.equal(await updates.tick(), false, 'hidden tab → no requests');
  visible = true;
  assert.equal(await updates.tick(), true, 'due and visible → runs');
  consent.deny();
  t += LIVE_INTERVAL_MS;
  assert.equal(await updates.tick(true), false, 'withdrawn → stops immediately');
  assert.equal(runs, 2);

  // never two at once
  consent.grant();
  let release;
  const slow = createLiveUpdates({ consent, isVisible: () => true, now: () => t, run: () => new Promise((r) => { release = r; }) });
  const first = slow.tick(true);
  assert.equal(await slow.tick(true), false);
  release();
  assert.equal(await first, true);
});
