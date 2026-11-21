// @ts-check
// Use case: read every service, update history, publish the snapshot.
// Depends only on the domain and on ports passed in (dependency inversion).
import { unknownReading } from '../domain/status.js';
import { applyReadings } from '../domain/history.js';
import { buildSnapshot } from '../domain/snapshot.js';

/**
 * @param {object} deps
 * @param {import('../domain/catalog.js').ServiceDefinition[]} deps.catalog
 * @param {Map<string, import('./ports.js').ProviderAdapter>} deps.adapters   keyed by kind
 * @param {import('./ports.js').HttpClient} deps.http
 * @param {import('./ports.js').HistoryStore} deps.historyStore
 * @param {import('./ports.js').Publisher[]} deps.publishers
 * @param {import('./ports.js').Logger} deps.logger
 * @param {() => Date} [deps.clock]
 * @returns {Promise<import('../domain/snapshot.js').Snapshot>}
 */
export async function collectStatuses({ catalog, adapters, http, historyStore, publishers, logger, clock = () => new Date() }) {
  const now = clock();

  // 1. Read all providers in parallel. One failing provider never breaks the others.
  const results = await Promise.all(
    catalog.map(async (service) => ({ id: service.id, reading: await readOne(service, adapters, http, logger) }))
  );

  // 2. Update the change history (pure domain logic).
  const previous = await historyStore.load();
  const { history, changed } = applyReadings(previous, results, now);
  if (changed) {
    await historyStore.save(history);
    logger.info('history changed');
  }

  // 3. Build and publish the snapshot.
  const snapshot = buildSnapshot(catalog, new Map(results.map((r) => [r.id, r.reading])), history, now);
  for (const publisher of publishers) await publisher.publish(snapshot, history);

  logger.info(summaryLine(snapshot));
  return snapshot;
}

/**
 * @param {import('../domain/catalog.js').ServiceDefinition} service
 * @param {Map<string, import('./ports.js').ProviderAdapter>} adapters
 * @param {import('./ports.js').HttpClient} http
 * @param {import('./ports.js').Logger} logger
 */
async function readOne(service, adapters, http, logger) {
  const adapter = adapters.get(service.kind);
  if (!adapter) throw new Error(`no adapter for kind "${service.kind}"`); // catalog validation should prevent this
  try {
    return await adapter.read(service, http);
  } catch (err) {
    logger.warn(`! ${service.id}: ${String(err instanceof Error ? err.message : err).slice(0, 80)}`);
    return unknownReading(); // shown as "Can't check" — never as working
  }
}

/** @param {import('../domain/snapshot.js').Snapshot} snapshot */
function summaryLine(snapshot) {
  const count = (/** @type {string} */ st) => snapshot.services.filter((s) => s.state === st).length;
  return `checked ${snapshot.services.length}: ok ${count('ok')}, minor ${count('minor')}, down ${count('down')}, maint ${count('maint')}, unknown ${count('unknown')}`;
}
