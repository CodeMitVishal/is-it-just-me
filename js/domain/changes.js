// @ts-check
// Domain: which followed services changed state since the last time we looked.

/**
 * @typedef {{ service: import('./status.js').Service, from: string, to: string }} StatusChange
 */

/**
 * "unknown" on either side is ignored: a failed check is not a real change.
 * @param {Record<string, string>} previous   id -> state from the last visit
 * @param {import('./status.js').Service[]} services
 * @param {(id: string) => boolean} isFollowed
 * @returns {StatusChange[]}
 */
export function detectChanges(previous, services, isFollowed) {
  return services
    .filter((s) => {
      const from = previous[s.id];
      return from && from !== s.state && from !== 'unknown' && s.state !== 'unknown' && isFollowed(s.id);
    })
    .map((s) => ({ service: s, from: previous[s.id], to: s.state }));
}

/** @param {import('./status.js').Service[]} services */
export const statesById = (services) => Object.fromEntries(services.map((s) => [s.id, s.state]));
