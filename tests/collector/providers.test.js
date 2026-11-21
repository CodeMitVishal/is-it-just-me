// Each provider adapter against real saved responses (tests/fixtures) and hand-written edge cases.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fixture, fixtureJson, fixtureText } from '../helpers.js';
import { parseStatuspage } from '../../collector/adapters/providers/statuspage.js';
import { parseAzureDevOps } from '../../collector/adapters/providers/azure-devops.js';
import { parseGoogleIncidents } from '../../collector/adapters/providers/google-incidents.js';
import { parseAwsHealth } from '../../collector/adapters/providers/aws-health.js';
import { parseAzureRss } from '../../collector/adapters/providers/azure-rss.js';
import { parseSlack } from '../../collector/adapters/providers/slack.js';
import { parseStatusIo } from '../../collector/adapters/providers/statusio.js';
import { parseStripe } from '../../collector/adapters/providers/stripe.js';
import noFeed from '../../collector/adapters/providers/no-feed.js';
import { cleanText } from '../../collector/adapters/providers/clean-text.js';
import { decodeBytes } from '../../collector/infrastructure/http-client.js';

test('statuspage: working, with no details', () => {
  assert.deepEqual(parseStatuspage(fixtureJson('statuspage-ok.json')), { state: 'ok', details: [] });
});

test('statuspage: minor incident keeps the incident title', () => {
  const r = parseStatuspage(fixtureJson('statuspage-minor.json'));
  assert.equal(r.state, 'minor');
  assert.match(r.details[0], /Cloudflare Workers/);
});

test('statuspage: bare ticket ids are hidden, affected components shown instead', () => {
  const r = parseStatuspage(fixtureJson('statuspage-down.json'));
  assert.equal(r.state, 'down');
  assert.ok(!r.details.some((d) => /^INC\d+/.test(d)));
  assert.ok(r.details.length > 0);
});

test('statuspage: maintenance indicator', () => {
  assert.equal(parseStatuspage(fixtureJson('statuspage-maint.json')).state, 'maint');
});

test('statuspage: in-progress maintenance turns a working page into "maint"', () => {
  const r = parseStatuspage({ status: { indicator: 'none' }, scheduled_maintenances: [{ name: 'DB upgrade', status: 'in_progress' }] });
  assert.deepEqual(r, { state: 'maint', details: ['DB upgrade'] });
});

test('statuspage: unknown indicator throws (shown as "Can\'t check", never as working)', () => {
  assert.throws(() => parseStatuspage({ status: { indicator: 'weird' } }));
});

test('azure devops: healthy fixture, and unhealthy lists the regions', () => {
  assert.equal(parseAzureDevOps(fixtureJson('azdo-ok.json')).state, 'ok');
  const r = parseAzureDevOps({ status: { health: 'unhealthy' }, services: [{ id: 'Pipelines', geographies: [{ name: 'Europe', health: 'unhealthy' }, { name: 'US', health: 'healthy' }] }] });
  assert.deepEqual(r, { state: 'down', details: ['Pipelines: Europe'] });
});

test('google incidents: only incidents without an end are active', () => {
  assert.equal(parseGoogleIncidents(fixtureJson('gcp-history.json')).state, 'ok');
  const r = parseGoogleIncidents([
    { end: '2026-01-01', status_impact: 'SERVICE_OUTAGE', external_desc: 'old' },
    { status_impact: 'SERVICE_DISRUPTION', external_desc: 'Slow BigQuery' },
  ]);
  assert.deepEqual(r, { state: 'minor', details: ['Slow BigQuery'] });
});

test('aws: decodes big-endian UTF-16 and ignores events older than 14 days', () => {
  const text = decodeBytes(fixture('aws-utf16be.bin'));
  assert.ok(text.startsWith('['));
  // The saved events are from early 2026 → ignored "today"
  assert.equal(parseAwsHealth(text, new Date('2026-11-21')).state, 'ok');
  // ...but counted when they are recent
  assert.equal(parseAwsHealth(text, new Date('2026-03-02T12:00:00Z')).state, 'down');
});

test('aws: empty body means no events', () => {
  assert.equal(parseAwsHealth('', new Date()).state, 'ok');
});

test('azure rss: empty feed is working, any item is a problem', () => {
  assert.equal(parseAzureRss(fixtureText('azure-ok.xml')).state, 'ok');
  const r = parseAzureRss('<rss><item><title>Storage &amp; VMs – West Europe</title></item></rss>');
  assert.deepEqual(r, { state: 'minor', details: ['Storage & VMs – West Europe'] });
});

test('slack: outage vs incident', () => {
  assert.equal(parseSlack(fixtureJson('slack-ok.json')).state, 'ok');
  assert.equal(parseSlack({ active_incidents: [{ type: 'incident', title: 'Slow' }] }).state, 'minor');
  assert.equal(parseSlack({ active_incidents: [{ type: 'outage', title: 'Down' }] }).state, 'down');
});

test('status.io (GitLab): status codes map to levels', () => {
  assert.equal(parseStatusIo(fixtureJson('statusio-ok.json')).state, 'ok');
  const mk = (code) => parseStatusIo({ result: { status_overall: { status_code: code }, status: [] } }).state;
  assert.deepEqual([mk(100), mk(200), mk(300), mk(500)], ['ok', 'maint', 'minor', 'down']);
});

test('stripe: largestatus', () => {
  assert.deepEqual(parseStripe(fixtureJson('stripe-ok.json')), { state: 'ok', details: [] });
  assert.equal(parseStripe({ largestatus: 'down', message: 'API down' }).state, 'down');
});

test('no-feed: unknown and flagged, without any network call', async () => {
  assert.deepEqual(await noFeed.read(), { state: 'unknown', details: [], noFeed: true });
});

test('cleanText strips markup, control characters and caps length', () => {
  assert.equal(cleanText('<b>Hi</b>\n<script>x</script> there'), 'Hi x there');
  assert.equal(cleanText('a'.repeat(500)).length, 180);
  assert.equal(cleanText(null), '');
});
