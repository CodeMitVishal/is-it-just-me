// @ts-check
// Domain: what a "status" is. Pure, no I/O, no dependencies.

/** @typedef {'ok' | 'maint' | 'minor' | 'down' | 'unknown'} StatusLevel */

export const Status = Object.freeze({
  OK: /** @type {StatusLevel} */ ('ok'),
  MAINTENANCE: /** @type {StatusLevel} */ ('maint'),
  MINOR: /** @type {StatusLevel} */ ('minor'),
  DOWN: /** @type {StatusLevel} */ ('down'),
  UNKNOWN: /** @type {StatusLevel} */ ('unknown'),
});

/** Higher number = worse. UNKNOWN is not ranked: it means "no information". */
const SEVERITY = Object.freeze({ ok: 0, maint: 1, minor: 2, down: 3 });

/** @param {string} level */
export const isKnown = (level) => Object.hasOwn(SEVERITY, level);

/** Returns the worse of two known levels. */
export function worse(/** @type {StatusLevel} */ a, /** @type {StatusLevel} */ b) {
  return SEVERITY[b] > SEVERITY[a] ? b : a;
}

/**
 * The result of reading one provider.
 * @typedef {{ state: StatusLevel, details: string[], noFeed?: boolean }} Reading
 */

/**
 * Creates a validated reading. Adapters must return their result through this.
 * @param {{ state: StatusLevel, details?: string[], noFeed?: boolean }} input
 * @returns {Reading}
 */
export function createReading({ state, details = [], noFeed = false }) {
  if (!isKnown(state) && state !== Status.UNKNOWN) throw new Error(`invalid status "${state}"`);
  // Working services need no explanation; keep the payload small.
  const kept = state === Status.OK ? [] : details.filter(Boolean).slice(0, 4);
  return Object.freeze({ state, details: kept, ...(noFeed ? { noFeed: true } : {}) });
}

/** A reading for when the provider could not be read. */
export const unknownReading = () => createReading({ state: Status.UNKNOWN });
