// @ts-check
// Slack status API v2.
import { Status, createReading, worse } from '../../domain/status.js';
import { cleanText } from './clean-text.js';

/** @param {any} json */
export function parseSlack(json) {
  if (!Array.isArray(json?.active_incidents)) throw new Error('unexpected format');
  let state = Status.OK;
  const details = [];
  for (const incident of json.active_incidents) {
    state = worse(state, incident.type === 'outage' ? Status.DOWN : Status.MINOR);
    details.push(cleanText(incident.title));
  }
  return createReading({ state, details });
}

/** @type {import('../../application/ports.js').ProviderAdapter} */
export default {
  kind: 'slack',
  read: async (service, http) => parseSlack(await http.json(/** @type {string} */ (service.url))),
};
