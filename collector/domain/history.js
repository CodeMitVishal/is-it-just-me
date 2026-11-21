// @ts-check
// Domain: remembering when a service changed state. Pure functions; returns new objects.
import { Status } from './status.js';

/**
 * @typedef {{ t: string, state: import('./status.js').StatusLevel, text: string }} HistoryEvent
 * @typedef {{ state: import('./status.js').StatusLevel, since: string, events: HistoryEvent[] }} ServiceHistory
 * @typedef {Record<string, ServiceHistory>} History
 */

const MAX_EVENTS = 20;

/**
 * Applies the latest readings to the history.
 * - "unknown" readings are ignored (a failed fetch is not a state change).
 * - The first time we see a service we only record its state, not an event.
 * @param {History} history
 * @param {{ id: string, reading: import('./status.js').Reading }[]} results
 * @param {Date} now
 * @returns {{ history: History, changed: boolean }}
 */
export function applyReadings(history, results, now) {
  const next = JSON.parse(JSON.stringify(history ?? {})); // deep copy (works in Node and Apps Script)
  const at = now.toISOString();
  let changed = false;

  for (const { id, reading } of results) {
    if (reading.state === Status.UNKNOWN) continue;
    const entry = next[id];
    if (!entry) {
      next[id] = { state: reading.state, since: at, events: [] };
      changed = true;
    } else if (entry.state !== reading.state) {
      entry.events = [{ t: at, state: reading.state, text: reading.details[0] ?? '' }, ...entry.events].slice(0, MAX_EVENTS);
      entry.state = reading.state;
      entry.since = at;
      changed = true;
    }
  }
  return { history: next, changed };
}

/**
 * When the current state started, but only if we actually saw the change happen.
 * (The first-seen time is just when we started watching, which would be misleading.)
 * @param {ServiceHistory | undefined} entry
 * @returns {string | undefined}
 */
export const observedSince = (entry) => (entry && entry.events.length ? entry.since : undefined);
