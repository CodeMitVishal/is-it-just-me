// @ts-check
// Atlassian Statuspage format (/api/v2/summary.json). Used by most companies.
import { Status, createReading } from '../../domain/status.js';
import { cleanText } from './clean-text.js';

const INDICATOR = { none: Status.OK, minor: Status.MINOR, major: Status.DOWN, critical: Status.DOWN, maintenance: Status.MAINTENANCE };
const TICKET_ID = /^[A-Z]{2,5}[-\s]?\d{4,}$/; // e.g. "INC20000369" says nothing to a reader

/** Pure parser, exported for tests. @param {any} json */
export function parseStatuspage(json) {
  let state = INDICATOR[/** @type {keyof INDICATOR} */ (json?.status?.indicator)];
  if (!state) throw new Error('unexpected indicator');

  const details = [];
  for (const incident of (json.incidents ?? []).slice(0, 4)) {
    const name = cleanText(incident.name);
    if (!TICKET_ID.test(name)) details.push(name);
  }
  for (const m of (json.scheduled_maintenances ?? []).filter((m) => m.status === 'in_progress').slice(0, 2)) {
    details.push(cleanText(m.name));
    if (state === Status.OK) state = Status.MAINTENANCE;
  }
  if (state !== Status.OK && details.length === 0) {
    for (const c of (json.components ?? []).filter((c) => c.status !== 'operational' && !c.group).slice(0, 4)) {
      details.push(cleanText(c.name));
    }
  }
  return createReading({ state, details });
}

/** @type {import('../../application/ports.js').ProviderAdapter} */
export default {
  kind: 'statuspage',
  read: async (service, http) => parseStatuspage(await http.json(/** @type {string} */ (service.url))),
};
