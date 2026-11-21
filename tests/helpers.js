// Shared test helpers.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const fixture = (name) => readFileSync(path.join(ROOT, 'tests/fixtures', name));
export const fixtureJson = (name) => JSON.parse(fixture(name).toString('utf8'));
export const fixtureText = (name) => fixture(name).toString('utf8');

/** A minimal web-domain Service for tests. */
export const svc = (overrides = {}) => ({
  id: 'x', name: 'X', sub: '', aka: '', cat: 'work', state: 'ok', details: [], since: null, page: 'https://x.example/', noFeed: false,
  ...overrides,
});

/** In-memory KeyValueStore fake. */
export function memoryStore(initial = {}) {
  const data = { ...initial };
  return { data, get: (k, fallback) => (k in data ? data[k] : fallback), set: (k, v) => { data[k] = v; } };
}
