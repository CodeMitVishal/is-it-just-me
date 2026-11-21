// @ts-check
// Use case: check every service live, directly from the visitor's browser.
// Each provider is read once per run. If one can't be reached, it shows "Can't check"
// for this run — never "working" by mistake.
import { LIVE_PARSERS } from '../domain/live-parsers.js';

/**
 * @param {import('../domain/status.js').Service[]} services
 * @param {import('./ports.js').LiveSource} source
 * @param {() => Date} [clock]
 * @returns {Promise<{ services: import('../domain/status.js').Service[], checked: number, total: number, checkedAt: string }>}
 */
export async function checkLive(services, source, clock = () => new Date()) {
  const results = await Promise.all(services.map(async (s) => {
    // No feed, or the provider blocks browsers: never claim anything about it.
    if (!s.live || !LIVE_PARSERS[s.live.kind]) return { ...s, state: 'unknown', details: [], checked: false };
    try {
      const reading = LIVE_PARSERS[s.live.kind](await source.fetchJson(s.live.url));
      return { ...s, state: reading.state, details: reading.details, checked: true };
    } catch {
      return { ...s, state: 'unknown', details: [], checked: false }; // offline, blocked or unexpected format
    }
  }));
  return {
    services: results,
    checked: results.filter((s) => s.checked).length,
    total: services.filter((s) => s.live).length,
    checkedAt: clock().toISOString(),
  };
}
