// @ts-check
// Use case: get the latest snapshot and make it safe to use.
import { normalizeSnapshot } from '../domain/snapshot.js';

/**
 * @param {import('./ports.js').StatusSource} source
 * @returns {Promise<import('../domain/snapshot.js').Snapshot>}
 */
export async function loadStatus(source) {
  return normalizeSnapshot(await source.fetchSnapshot());
}
