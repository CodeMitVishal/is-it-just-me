// Website domain + application logic (runs in Node: these layers never touch the browser).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { svc, memoryStore } from '../helpers.js';
import { summarize, isStale, disruptedIn } from '../../web/js/domain/summary.js';
import { searchServices } from '../../web/js/domain/search.js';

import { detectChanges } from '../../web/js/domain/changes.js';
import { bySeverity } from '../../web/js/domain/status.js';
import { createFollows } from '../../web/js/application/follows.js';
import { createChangeAlerts } from '../../web/js/application/change-alerts.js';
import { createPreferences } from '../../web/js/application/preferences.js';

test('summary: everything working', () => {
  const s = summarize([svc({ state: 'ok' }), svc({ state: 'ok' }), svc({ state: 'unknown' })]);
  assert.deepEqual(s, { total: 3, checkable: 2, down: 0, minor: 0, maint: 0, disrupted: 0, overall: 'ok' });
});

test('summary: problems; maintenance is not a disruption', () => {
  const s = summarize([svc({ state: 'down' }), svc({ state: 'minor' }), svc({ state: 'maint' })]);
  assert.equal(s.disrupted, 2);
  assert.equal(s.overall, 'down');
  assert.equal(disruptedIn([svc({ state: 'minor', cat: 'dev' }), svc({ state: 'down', cat: 'hr' })], 'dev'), 1);
});

test('stale data after 45 minutes', () => {
  const now = new Date('2026-11-21T12:00:00Z');
  assert.equal(isStale('2026-11-21T11:30:00Z', now), false);
  assert.equal(isStale('2026-11-21T11:00:00Z', now), true);
});

test('search: aliases find the right service; no query = null', () => {
  const all = [
    svc({ id: 'atlassian', name: 'Atlassian', sub: 'Jira, Confluence, Trello', aka: 'jira confluence' }),
    svc({ id: 'm365', name: 'Microsoft 365', aka: 'office outlook email' }),
    svc({ id: 'teams', name: 'Microsoft Teams' }),
  ];
  assert.equal(searchServices(all, 'jira')[0].id, 'atlassian');
  assert.equal(searchServices(all, 'Outlook')[0].id, 'm365');
  assert.equal(searchServices(all, 'teams')[0].id, 'teams');
  assert.deepEqual(searchServices(all, 'zzz'), []);
  assert.equal(searchServices(all, '   '), null);
});

test('sort: worst first, then by name', () => {
  const sorted = [svc({ name: 'B' }), svc({ name: 'A', state: 'minor' }), svc({ name: 'C', state: 'down' })].sort(bySeverity);
  assert.deepEqual(sorted.map((s) => s.name), ['C', 'A', 'B']);
});


test('changes: only followed services, and never to/from unknown', () => {
  const services = [svc({ id: 'a', state: 'down' }), svc({ id: 'b', state: 'down' }), svc({ id: 'c', state: 'unknown' })];
  const prev = { a: 'ok', b: 'ok', c: 'ok' };
  const changes = detectChanges(prev, services, (id) => id !== 'b');
  assert.deepEqual(changes.map((c) => [c.service.id, c.from, c.to]), [['a', 'ok', 'down']]);
});

test('follows: toggle persists', () => {
  const store = memoryStore();
  const follows = createFollows(store);
  assert.equal(follows.toggle('zoom'), true);
  assert.deepEqual(store.data.follows, ['zoom']);
  assert.equal(createFollows(store).has('zoom'), true, 'restored on next visit');
  assert.equal(follows.toggle('zoom'), false);
});

test('change alerts: compares with the last visit and remembers the new states', () => {
  const store = memoryStore({ lastSeen: { a: 'ok' }, follows: ['a'] });
  const alerts = createChangeAlerts(store, createFollows(store));
  assert.equal(alerts.check([svc({ id: 'a', state: 'down' })]).length, 1);
  assert.deepEqual(store.data.lastSeen, { a: 'down' });
  assert.equal(alerts.check([svc({ id: 'a', state: 'down' })]).length, 0);
});

test('preferences: only allowed values are saved', () => {
  const store = memoryStore();
  const prefs = createPreferences(store, { theme: 'light', font: 'modern', lang: 'en' });
  assert.equal(prefs.set('theme', 'dark'), true);
  assert.equal(prefs.set('theme', 'neon'), false);
  assert.equal(prefs.get('theme'), 'dark');
  assert.equal(store.data.theme, 'dark');
});
