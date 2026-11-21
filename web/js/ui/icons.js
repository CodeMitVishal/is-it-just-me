// @ts-check
// Inline SVG icons. Status icons differ by shape AND colour, so they work without colour vision.

const NS = 'http://www.w3.org/2000/svg';
/** @typedef {[string, Record<string, string | number>]} Part */
const path = (/** @type {string} */ d, /** @type {string} */ cls = '') => /** @type {Part} */ (['path', cls ? { d, class: cls } : { d }]);
const circle = (/** @type {Record<string, string | number>} */ attrs) => /** @type {Part} */ (['circle', attrs]);

/** @type {Record<string, Part[]>} */
const STATUS_SHAPES = {
  ok: [circle({ cx: 12, cy: 12, r: 10, class: 'sh' }), path('M7.5 12.4l3 3 6-6.4', 'mk')],
  minor: [path('M10.3 3.6a2 2 0 0 1 3.4 0l8.2 14.2A2 2 0 0 1 20.2 21H3.8a2 2 0 0 1-1.7-3.2z', 'sh'), path('M12 9v4.5', 'mk'), path('M12 17.3v.01', 'mk')],
  down: [path('M8.1 2h7.8L22 8.1v7.8L15.9 22H8.1L2 15.9V8.1z', 'sh'), path('M9 9l6 6M15 9l-6 6', 'mk')],
  maint: [circle({ cx: 12, cy: 12, r: 10, class: 'sh' }), path('M12 7v5.2l3.2 2', 'mk')],
  unknown: [circle({ cx: 12, cy: 12, r: 9, class: 'ring' }), path('M9.6 9.4a2.5 2.5 0 1 1 3.6 2.3c-.8.4-1.2.9-1.2 1.7v.4', 'mk2'), path('M12 16.8v.01', 'mk2')],
};

/** @type {Record<string, Part[]>} */
const UI_SHAPES = {
  bell: [path('M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9'), path('M10.3 21a1.94 1.94 0 0 0 3.4 0')],
  external: [path('M14 4h6v6'), path('M20 4l-9 9'), path('M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5')],
  chevron: [path('M9 6l6 6-6 6')],
  rss: [path('M5 11a8 8 0 0 1 8 8'), path('M5 5a14 14 0 0 1 14 14'), circle({ cx: 5.5, cy: 18.5, r: 1.2 })],
};

/** @param {Part[]} parts @param {string} className */
function build(parts, className) {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.setAttribute('class', className);
  for (const [tag, attrs] of parts) {
    const node = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
    svg.append(node);
  }
  return svg;
}

/** @param {string} state */
export const statusIcon = (state) => build(STATUS_SHAPES[state] ?? STATUS_SHAPES.unknown, `st-ic st-${state}`);

/** @param {keyof typeof UI_SHAPES} name @param {string} [className] */
export const icon = (name, className = 'i') => build(UI_SHAPES[name], className);
