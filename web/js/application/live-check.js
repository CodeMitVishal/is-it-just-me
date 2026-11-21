// @ts-check
// Use case: "Check live now". Only runs when the visitor presses the button.
// Each supported service is read directly from its provider; anything that fails keeps
// the last collected value (never shown as "working" by mistake).
import { LIVE_PARSERS } from '../domain/live-parsers.js';

/**
 * @param {import('../domain/snapshot.js').Snapshot} snapshot
 * @param {import('./ports.js').LiveSource} source
 * @param {() => Date} [clock]
 * @returns {Promise<{ snapshot: import('../domain/snapshot.js').Snapshot, checked: number, total: number }>}
 */
export async function checkLive(snapshot, source, clock = () => new Date()) {
  const candidates = snapshot.services.filter((s) => s.live && LIVE_PARSERS[s.live.kind]);
  const now = clock().toISOString();

  const results = await Promise.all(candidates.map(async (s) => {
    try {
      const reading = LIVE_PARSERS[s.live.kind](await source.fetchJson(s.live.url));
      return [s.id, reading];
    } catch {
      return [s.id, null]; // blocked, offline or unexpected format → keep the collected value
    }
  }));
  const byId = new Map(results.filter(([, r]) => r));

  const services = snapshot.services.map((s) => {
    const reading = byId.get(s.id);
    if (!reading) return s;
    const changed = reading.state !== s.state;
    return { ...s, state: reading.state, details: reading.details, since: changed ? null : s.since, checkedLive: true };
  });

  return { snapshot: { ...snapshot, services, liveCheckedAt: now }, checked: byId.size, total: candidates.length };
}
