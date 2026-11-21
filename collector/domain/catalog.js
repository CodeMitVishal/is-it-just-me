// @ts-check
// Domain: the list of services we watch, and the rules every entry must follow.

/**
 * @typedef {object} ServiceDefinition
 * @property {string} id        lowercase id, used in URLs and file names
 * @property {string} name      display name
 * @property {string} [sub]     short description, e.g. "Meet, Gmail, Drive"
 * @property {string} [aka]     extra search words
 * @property {Category} cat     group shown on the site
 * @property {string} kind      which provider adapter reads it
 * @property {string} [url]     machine-readable status endpoint (https)
 * @property {string} page      official human status page (https)
 * @property {string} [icon]    path of the official icon inside web/, e.g. "icons/zoom.png"
 */

/** @typedef {'meet' | 'dev' | 'cloud' | 'ai' | 'hr' | 'work'} Category */
export const CATEGORIES = Object.freeze(['meet', 'dev', 'cloud', 'ai', 'hr', 'work']);

const ID = /^[a-z0-9-]{1,40}$/;
export const ICON_PATH = /^icons\/[a-z0-9-]{1,40}\.(png|ico|svg|webp|jpg)$/;
const isHttps = (/** @type {unknown} */ u) => typeof u === 'string' && u.startsWith('https://');

/**
 * Validates the whole catalog. Throws with a clear message on the first bad entry,
 * so a typo in config fails the build instead of shipping a broken page.
 * @param {unknown} entries
 * @param {{ knownKinds: string[] }} options
 * @returns {ServiceDefinition[]}
 */
export function validateCatalog(entries, { knownKinds }) {
  if (!Array.isArray(entries) || entries.length === 0) throw new Error('catalog must be a non-empty array');
  const seen = new Set();
  for (const s of entries) {
    const where = `catalog entry "${s?.id ?? '?'}"`;
    if (!ID.test(s?.id ?? '')) throw new Error(`${where}: id must match ${ID}`);
    if (seen.has(s.id)) throw new Error(`${where}: duplicate id`);
    seen.add(s.id);
    if (typeof s.name !== 'string' || !s.name.trim()) throw new Error(`${where}: name is required`);
    if (!CATEGORIES.includes(s.cat)) throw new Error(`${where}: cat must be one of ${CATEGORIES.join(', ')}`);
    if (!knownKinds.includes(s.kind)) throw new Error(`${where}: unknown kind "${s.kind}"`);
    if (!isHttps(s.page)) throw new Error(`${where}: page must be an https URL`);
    if (s.kind !== 'none' && !isHttps(s.url)) throw new Error(`${where}: url must be an https URL`);
    if (s.icon !== undefined && !ICON_PATH.test(s.icon)) throw new Error(`${where}: icon must match ${ICON_PATH}`);
  }
  return /** @type {ServiceDefinition[]} */ (entries);
}
