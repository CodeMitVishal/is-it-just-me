// @ts-check
// Domain: the list of services (web/catalog.json) turned into safe, well-typed Services.
// Anything unexpected is dropped or replaced with a safe default — never trusted as-is.
// Every service starts as "unknown" until the visitor's browser has checked it live.
import { CATEGORIES } from './status.js';
import { LIVE_KINDS } from './live-parsers.js';

/** @typedef {{ generatedAt: string, services: import('./status.js').Service[] }} Snapshot */

const ID = /^[a-z0-9-]{1,40}$/;
const ICON = /^icons\/[a-z0-9-]{1,40}\.(png|ico|svg|webp|jpg)$/; // same-site images only
const str = (/** @type {unknown} */ v, /** @type {number} */ max) => (typeof v === 'string' ? v.slice(0, max) : '');
const httpsOnly = (/** @type {unknown} */ u) => {
  try { const url = new URL(String(u)); return url.protocol === 'https:' ? url.href : ''; } catch { return ''; }
};

/**
 * @param {any} raw  contents of catalog.json
 * @returns {import('./status.js').Service[]}
 */
export function normalizeCatalog(raw) {
  if (!raw || !Array.isArray(raw.services)) throw new Error('invalid catalog');
  return raw.services
    .filter((s) => s && ID.test(s.id) && typeof s.name === 'string' && s.name.trim())
    .map((s) => {
      const liveUrl = s.live && LIVE_KINDS.includes(s.live.kind) ? httpsOnly(s.live.url) : '';
      return {
        id: s.id,
        name: str(s.name, 60),
        sub: str(s.sub, 80),
        aka: str(s.aka, 200),
        cat: CATEGORIES.includes(s.cat) ? s.cat : 'work',
        state: 'unknown',
        details: [],
        since: null,
        page: httpsOnly(s.page),
        icon: typeof s.icon === 'string' && ICON.test(s.icon) ? s.icon : '',
        noFeed: s.noFeed === true,
        browserBlocked: s.browserBlocked === true,
        live: liveUrl ? { kind: s.live.kind, url: liveUrl } : null,
        checked: false,
      };
    });
}
