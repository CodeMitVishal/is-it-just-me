// Contract: what the collector writes, the website reads back unchanged.
// The two sides share no code — this test is what keeps them compatible.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { ROOT } from './helpers.js';
import { collectStatuses } from '../collector/application/collect-statuses.js';
import { createReading } from '../collector/domain/status.js';
import { normalizeSnapshot } from '../web/js/domain/snapshot.js';

test('every service in config survives collector → status.json → website', async () => {
  const catalog = JSON.parse(readFileSync(path.join(ROOT, 'config/services.json'), 'utf8'));
  const states = ['ok', 'minor', 'down', 'maint', 'unknown'];
  const kinds = [...new Set(catalog.map((s) => s.kind))];
  const adapters = new Map(kinds.map((kind) => [kind, {
    kind,
    read: async (s) => createReading({ state: states[catalog.indexOf(s) % states.length], details: ['Example text'], noFeed: kind === 'none' }),
  }]));
  let written;
  await collectStatuses({
    catalog, adapters, http: {},
    historyStore: { load: async () => ({}), save: async () => {} },
    publishers: [{ publish: async (s) => { written = JSON.parse(JSON.stringify(s)); } }],
    logger: { info() {}, warn() {} },
    clock: () => new Date('2026-11-21T10:00:00Z'),
  });

  const read = normalizeSnapshot(written);
  assert.equal(read.services.length, catalog.length, 'no service dropped');
  read.services.forEach((s, i) => {
    const w = written.services[i];
    assert.equal(s.id, w.id);
    assert.equal(s.name, w.name);
    assert.equal(s.cat, w.cat);
    assert.equal(s.state, w.state);
    assert.equal(s.page, w.page);
    assert.deepEqual(s.details, w.details);
    assert.equal(s.sub, w.sub ?? '');
  });
});
