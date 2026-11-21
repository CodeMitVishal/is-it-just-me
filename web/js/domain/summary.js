// @ts-check
// Domain: the numbers behind the headline ("4 tools have problems right now").
import { isDisrupted } from './status.js';

/**
 * @typedef {object} Summary
 * @property {number} total
 * @property {number} checkable   services we have live data for
 * @property {number} down
 * @property {number} minor
 * @property {number} maint
 * @property {number} disrupted   down + minor
 * @property {'ok' | 'minor' | 'down'} overall
 */

/**
 * @param {import('./status.js').Service[]} services
 * @returns {Summary}
 */
export function summarize(services) {
  const count = (/** @type {string} */ st) => services.filter((s) => s.state === st).length;
  const down = count('down');
  const minor = count('minor');
  return {
    total: services.length,
    checkable: services.length - count('unknown'),
    down,
    minor,
    maint: count('maint'),
    disrupted: down + minor,
    overall: down ? 'down' : minor ? 'minor' : 'ok',
  };
}

/** Problems per category, for the filter badges. */
export function disruptedIn(/** @type {import('./status.js').Service[]} */ services, /** @type {string} */ cat) {
  return services.filter((s) => (cat === 'all' || s.cat === cat) && isDisrupted(s)).length;
}

/**
 * True when the data is older than expected (the scheduled checker may be paused).
 * @param {string} generatedAt
 * @param {Date} now
 * @param {number} [maxMinutes]
 */
export const isStale = (generatedAt, now, maxMinutes = 45) => (now.getTime() - Date.parse(generatedAt)) / 60000 > maxMinutes;
