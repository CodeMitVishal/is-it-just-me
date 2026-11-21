// @ts-check
// Short messages at the bottom of the screen (announced to screen readers via aria-live).
import { byId, el } from '../dom.js';

const VISIBLE_MS = 4200;

/** @param {string} message */
export function showToast(message) {
  const toast = el('div', 'toast', message);
  byId('toasts').append(toast);
  setTimeout(() => {
    toast.classList.add('out');
    setTimeout(() => toast.remove(), 300);
  }, VISIBLE_MS);
}
