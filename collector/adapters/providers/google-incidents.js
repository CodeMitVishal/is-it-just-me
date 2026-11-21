// @ts-check
// Google incidents.json format (Google Cloud and Google Workspace).
// The file is the full incident history; an incident without "end" is still active.
import { Status, createReading, worse } from '../../domain/status.js';
import { cleanText } from './clean-text.js';

/** @param {any} json */
export function parseGoogleIncidents(json) {
  if (!Array.isArray(json)) throw new Error('unexpected format');
  let state = Status.OK;
  const details = [];
  for (const incident of json.filter((i) => !i.end)) {
    state = worse(state, incident.status_impact === 'SERVICE_OUTAGE' ? Status.DOWN : Status.MINOR);
    details.push(cleanText(incident.external_desc));
  }
  return createReading({ state, details });
}

/** @type {import('../../application/ports.js').ProviderAdapter} */
export default {
  kind: 'gcpjson',
  read: async (service, http) => parseGoogleIncidents(await http.json(/** @type {string} */ (service.url))),
};
