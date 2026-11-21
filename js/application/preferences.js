// @ts-check
// Use case: the visitor's display choices (theme, font, language).
// The allowed values are repeated in js/boot/preferences-boot.js, which must run before
// modules load (to avoid a flash of the wrong theme). Keep the two lists in sync.

export const PREFERENCE_OPTIONS = Object.freeze({
  theme: ['light', 'dark', 'contrast'],
  font: ['modern', 'easy', 'friendly'],
  lang: ['en', 'de', 'hi'],
});

/** @typedef {keyof typeof PREFERENCE_OPTIONS} PreferenceName */

/**
 * @param {import('./ports.js').KeyValueStore} store
 * @param {Record<PreferenceName, string>} current   values already applied by the boot script
 */
export function createPreferences(store, current) {
  const values = { ...current };
  return {
    get: (/** @type {PreferenceName} */ name) => values[name],
    /** @returns {boolean} false if the value is not allowed */
    set(/** @type {PreferenceName} */ name, /** @type {string} */ value) {
      if (!PREFERENCE_OPTIONS[name]?.includes(value)) return false;
      values[name] = value;
      store.set(name, value);
      return true;
    },
  };
}

/** @typedef {ReturnType<typeof createPreferences>} Preferences */
