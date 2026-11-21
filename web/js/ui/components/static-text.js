// @ts-check
// Translates the fixed text in index.html (elements marked with data-i18n attributes) + the tab title.

/** @param {import('../../i18n/i18n.js').I18n['t']} t */
export function translatePage(t) {
  document.querySelectorAll('[data-i18n]').forEach((n) => { n.textContent = t(/** @type {string} */ (/** @type {HTMLElement} */ (n).dataset.i18n)); });
  document.querySelectorAll('[data-i18n-ph]').forEach((n) => { /** @type {HTMLInputElement} */ (n).placeholder = t(/** @type {string} */ (/** @type {HTMLElement} */ (n).dataset.i18nPh)); });
  document.querySelectorAll('[data-i18n-aria]').forEach((n) => { n.setAttribute('aria-label', t(/** @type {string} */ (/** @type {HTMLElement} */ (n).dataset.i18nAria))); });
  document.title = t('title');
}
