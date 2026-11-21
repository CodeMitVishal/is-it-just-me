// @ts-check
// Tiny DOM helpers. Text always goes in via textContent — never innerHTML (XSS-safe by design).

/** @param {string} id */
export function byId(id) {
  const node = document.getElementById(id);
  if (!node) throw new Error(`#${id} not found in index.html`);
  return node;
}

/**
 * @template {keyof HTMLElementTagNameMap} K
 * @param {K} tag
 * @param {string} [className]
 * @param {string | number | null} [text]
 * @returns {HTMLElementTagNameMap[K]}
 */
export function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = String(text);
  return node;
}

/** Restarts a CSS animation class on an element. */
export function replayClass(/** @type {Element} */ node, /** @type {string} */ className) {
  node.classList.remove(className);
  void (/** @type {HTMLElement} */ (node)).offsetWidth; // force reflow
  node.classList.add(className);
}

export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
