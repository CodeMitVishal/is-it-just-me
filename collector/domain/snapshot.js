// @ts-check
// Domain: the public snapshot written to web/data/status.json.
// This shape is the contract with the website — see docs/DATA_CONTRACT.md.
import { observedSince } from './history.js';

/**
 * @typedef {object} SnapshotService
 * @property {string} id
 * @property {string} name
 * @property {string} [sub]
 * @property {string} [aka]
 * @property {string} cat
 * @property {string} page
 * @property {string} [icon]      official icon, relative to the site root
 * @property {import('./status.js').StatusLevel} state
 * @property {string[]} details   text written by the provider (English)
 * @property {string} [since]     ISO time the current state began (only if observed)
 * @property {boolean} [noFeed]   provider publishes no public live status
 *
 * @typedef {{ generatedAt: string, services: SnapshotService[] }} Snapshot
 */

/**
 * @param {import('./catalog.js').ServiceDefinition[]} catalog
 * @param {Map<string, import('./status.js').Reading>} readings
 * @param {import('./history.js').History} history
 * @param {Date} now
 * @returns {Snapshot}
 */
export function buildSnapshot(catalog, readings, history, now) {
  const services = catalog.map((def) => {
    const reading = readings.get(def.id);
    if (!reading) throw new Error(`missing reading for ${def.id}`);
    const since = reading.state === 'unknown' ? undefined : observedSince(history[def.id]);
    return {
      id: def.id,
      name: def.name,
      ...(def.sub ? { sub: def.sub } : {}),
      ...(def.aka ? { aka: def.aka } : {}),
      cat: def.cat,
      page: def.page,
      ...(def.icon ? { icon: def.icon } : {}),
      state: reading.state,
      details: [...reading.details],
      ...(since ? { since } : {}),
      ...(reading.noFeed ? { noFeed: true } : {}),
    };
  });
  return { generatedAt: now.toISOString(), services };
}
