// @ts-check
// StatusSource: loads data/status.json from GitHub Pages — the only place browsers read data from.
//
// Deliberately NO cache-busting: GitHub Pages' CDN caches the file (~10 minutes) and the browser
// honours that too. Every visitor reads the same cached copy, so the status providers are asked
// only once per update by the cloud updater, never once per visitor.

/**
 * @param {string} url  relative URL, e.g. "data/status.json"
 * @returns {import('../application/ports.js').StatusSource}
 */
export function createStatusSource(url) {
  return {
    async fetchSnapshot() {
      const res = await fetch(url, { cache: 'default', credentials: 'omit' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
  };
}
