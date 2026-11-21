// @ts-check
// KeyValueStore backed by localStorage. Never throws: private mode or blocked storage
// just means choices aren't remembered.

/** @returns {import('../application/ports.js').KeyValueStore} */
export function createLocalStore() {
  return {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw == null ? fallback : JSON.parse(raw);
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
    },
  };
}
