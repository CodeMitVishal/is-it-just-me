// @ts-check
// Use case: notice when a followed service changes, remembering what we last saw across visits.
import { detectChanges, statesById } from '../domain/changes.js';

const KEY = 'lastSeen';

/**
 * @param {import('./ports.js').KeyValueStore} store
 * @param {import('./follows.js').Follows} follows
 */
export function createChangeAlerts(store, follows) {
  return {
    /**
     * Compares with the last visit, saves the new states, returns the changes to announce.
     * @param {import('../domain/status.js').Service[]} services
     */
    check(services) {
      const changes = detectChanges(store.get(KEY, {}), services, follows.has);
      store.set(KEY, statesById(services));
      return changes;
    },
  };
}
