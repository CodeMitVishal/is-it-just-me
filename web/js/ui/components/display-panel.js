// @ts-check
// The "Display" panel: theme, font and language radio groups.
import { byId } from '../dom.js';

/**
 * @param {object} deps
 * @param {import('../../application/preferences.js').Preferences} deps.preferences
 * @param {(lang: string) => void} deps.onLanguageChange
 */
export function mountDisplayPanel({ preferences, onLanguageChange }) {
  const root = document.documentElement;
  const panel = byId('displayPanel');
  const toggle = byId('displayBtn');

  // Reflect current choices in the radios.
  for (const name of /** @type {const} */ (['theme', 'font', 'lang'])) {
    const current = /** @type {HTMLInputElement | null} */ (document.querySelector(`input[name="${name}"][value="${preferences.get(name)}"]`));
    if (current) current.checked = true;
  }

  panel.addEventListener('change', (e) => {
    const input = /** @type {HTMLInputElement} */ (e.target);
    const name = /** @type {'theme' | 'font' | 'lang'} */ (input.name);
    if (!preferences.set(name, input.value)) return;
    if (name === 'lang') { root.lang = input.value; onLanguageChange(input.value); }
    else root.dataset[name] = input.value;
  });

  const setOpen = (/** @type {boolean} */ open) => {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    if (open) /** @type {HTMLElement | null} */ (panel.querySelector('input:checked'))?.focus();
  };
  toggle.addEventListener('click', () => setOpen(panel.hidden));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) { setOpen(false); toggle.focus(); }
  });
  document.addEventListener('click', (e) => {
    if (!panel.hidden && !(/** @type {Element} */ (e.target)).closest('.top')) setOpen(false);
  });
}
