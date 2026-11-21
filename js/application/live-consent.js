// @ts-check
// Use case: the visitor's choice about live checks (GDPR).
// Live checks make the visitor's browser contact the companies' status pages, which then see the
// visitor's IP address. That only happens after the visitor says yes, and the choice can be
// changed at any time (Display panel). Stored only in the visitor's own browser.

const KEY = 'liveConsent';
const VALUES = ['granted', 'denied'];

/** @param {import('./ports.js').KeyValueStore} store */
export function createLiveConsent(store) {
  let value = VALUES.includes(store.get(KEY, null)) ? store.get(KEY, null) : null;
  return {
    /** @returns {'granted' | 'denied' | null}  null = not asked yet */
    get: () => value,
    isGranted: () => value === 'granted',
    grant() { value = 'granted'; store.set(KEY, value); },
    deny() { value = 'denied'; store.set(KEY, value); },
  };
}

/** @typedef {ReturnType<typeof createLiveConsent>} LiveConsent */
