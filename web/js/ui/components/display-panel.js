// @ts-check
// The "Display" panel: theme, font, language — and the live-check switch (GDPR: withdrawing
// permission must be as easy as giving it).
import { byId } from '../dom.js';

/**
 * @param {object} deps
 * @param {import('../../application/preferences.js').Preferences} deps.preferences
 * @param {(lang: string) => void} deps.onLanguageChange
 * @param {(on: boolean) => void} deps.onLiveChange
 */
export function mountDisplayPanel({ preferences, onLanguageChange, onLiveChange }) {
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
    if (input.name === 'live') { onLiveChange(input.value === 'on'); return; }
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

/** Keeps the live-check radios in sync with the current choice. */
export function syncLiveSwitch(/** @type {'granted' | 'denied' | null} */ choice) {
  for (const input of /** @type {NodeListOf<HTMLInputElement>} */ (document.querySelectorAll('input[name="live"]'))) {
    input.checked = (input.value === 'on' && choice === 'granted') || (input.value === 'off' && choice !== 'granted');
  }
}
