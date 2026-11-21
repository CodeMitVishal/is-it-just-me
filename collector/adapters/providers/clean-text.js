// @ts-check
// Security boundary: every string taken from a provider passes through cleanText.
// Strips HTML tags and control characters, decodes basic entities, caps length.

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'" };

/**
 * @param {unknown} value
 * @param {number} [max]
 * @returns {string}
 */
export function cleanText(value, max = 180) {
  return String(value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(amp|lt|gt|quot|#39);/g, (_, e) => ENTITIES[/** @type {keyof ENTITIES} */ (e)])
    .replace(/[\u0000-\u001f\u007f<>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}
