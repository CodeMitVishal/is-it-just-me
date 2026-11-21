// @ts-check
// Domain: turns untrusted JSON (data/status.json) into safe, well-typed Services.
// Anything unexpected is dropped or replaced with a safe default — never trusted as-is.
import { STATUSES, CATEGORIES } from './status.js';

/** @typedef {{ generatedAt: string, services: import('./status.js').Service[] }} Snapshot */

const ID = /^[a-z0-9-]{1,40}$/;
const ICON = /^icons\/[a-z0-9-]{1,40}\.(png|ico|svg|webp|jpg)$/; // same-site images only
const str = (/** @type {unknown} */ v, /** @type {number} */ max) => (typeof v === 'string' ? v.slice(0, max) : '');
const isDate = (/** @type {unknown} */ v) => typeof v === 'string' && !Number.isNaN(Date.parse(v));
const httpsOnly = (/** @type {unknown} */ u) => {
  try { const url = new URL(String(u)); return url.protocol === 'https:' ? url.href : ''; } catch { return ''; }
};

/**
 * @param {any} raw
 * @returns {Snapshot}
 */
export function normalizeSnapshot(raw) {
  if (!raw || !Array.isArray(raw.services) || !isDate(raw.generatedAt)) throw new Error('invalid status data');
  const services = raw.services
    .filter((s) => s && ID.test(s.id) && typeof s.name === 'string' && s.name.trim())
    .map((s) => ({
      id: s.id,
      name: str(s.name, 60),
      sub: str(s.sub, 80),
      aka: str(s.aka, 200),
      cat: CATEGORIES.includes(s.cat) ? s.cat : 'work',
      state: STATUSES.includes(s.state) ? s.state : 'unknown',
      details: Array.isArray(s.details) ? s.details.slice(0, 4).map((d) => str(d, 220)).filter(Boolean) : [],
      since: isDate(s.since) ? s.since : null,
      page: httpsOnly(s.page),
      icon: typeof s.icon === 'string' && ICON.test(s.icon) ? s.icon : '',
      noFeed: s.noFeed === true,
    }));
  return { generatedAt: raw.generatedAt, services };
}
