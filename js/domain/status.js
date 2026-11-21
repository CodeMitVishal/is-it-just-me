// @ts-check
// Domain: status levels and categories as the website understands them. Pure.

/** @typedef {'ok' | 'minor' | 'down' | 'maint' | 'unknown'} StatusLevel */
/** @typedef {'meet' | 'dev' | 'cloud' | 'ai' | 'hr' | 'work'} Category */

/**
 * @typedef {object} Service
 * @property {string} id
 * @property {string} name
 * @property {string} sub
 * @property {string} aka
 * @property {Category} cat
 * @property {StatusLevel} state
 * @property {string[]} details   provider's own words (English)
 * @property {string | null} since
 * @property {string} page
 * @property {string} icon        official icon path, or '' (monogram fallback)
 * @property {boolean} noFeed          the company publishes no public live status
 * @property {boolean} browserBlocked  the company has a feed but blocks browsers (AWS, Azure, Stripe)
 * @property {{ kind: string, url: string } | null} live   feed the browser reads directly
 * @property {boolean} checked         true once this run read it successfully
 */

/** Display order for the legend. */
export const STATUSES = /** @type {const} */ (['ok', 'minor', 'down', 'maint', 'unknown']);
export const CATEGORIES = /** @type {const} */ (['meet', 'dev', 'cloud', 'ai', 'hr', 'work']);

const SEVERITY = { down: 4, minor: 3, maint: 2, unknown: 1, ok: 0 };

/** Something the user should know about (not "unknown": that is missing data, not a problem). */
export const isProblem = (/** @type {Service} */ s) => s.state === 'down' || s.state === 'minor' || s.state === 'maint';

/** Counts as "has problems" in headlines (maintenance is planned, so it doesn't). */
export const isDisrupted = (/** @type {Service} */ s) => s.state === 'down' || s.state === 'minor';

/** Sort: worst first, then alphabetical. */
export const bySeverity = (/** @type {Service} */ a, /** @type {Service} */ b) =>
  SEVERITY[b.state] - SEVERITY[a.state] || a.name.localeCompare(b.name);

export const byName = (/** @type {Service} */ a, /** @type {Service} */ b) => a.name.localeCompare(b.name);
