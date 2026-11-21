// @ts-check
// StatusSource: loads data/status.json from the same site (the page's CSP allows nothing else).

/**
 * @param {string} url  relative URL, e.g. "data/status.json"
 * @returns {import('../application/ports.js').StatusSource}
 */
export function createStatusSource(url) {
  return {
    async fetchSnapshot() {
      // Cache-buster: GitHub Pages' CDN caches files for ~10 minutes.
      const res = await fetch(`${url}?t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
  };
}
