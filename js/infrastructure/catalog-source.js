// @ts-check
// CatalogSource: the list of services (catalog.json), served from this same site.

/**
 * @param {string} url  relative URL, e.g. "catalog.json"
 * @returns {import('../application/ports.js').CatalogSource}
 */
export function createCatalogSource(url) {
  return {
    async fetchCatalog() {
      const res = await fetch(url, { credentials: 'omit' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
  };
}
