// @ts-check
// Use case: follow / unfollow services. Saved only in the visitor's own browser.

const KEY = 'follows';

/**
 * @param {import('./ports.js').KeyValueStore} store
 */
export function createFollows(store) {
  const ids = new Set(store.get(KEY, /** @type {string[]} */ ([])).filter((x) => typeof x === 'string'));
  return {
    has: (/** @type {string} */ id) => ids.has(id),
    /** @returns {boolean} true if now following */
    toggle(/** @type {string} */ id) {
      if (ids.has(id)) ids.delete(id); else ids.add(id);
      store.set(KEY, [...ids]);
      return ids.has(id);
    },
  };
}

/** @typedef {ReturnType<typeof createFollows>} Follows */
