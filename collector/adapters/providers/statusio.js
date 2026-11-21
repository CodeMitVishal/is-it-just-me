// @ts-check
// status.io public API (used by GitLab). Codes: 100 ok, 200 maintenance, 300/400 degraded, 500+ outage.
import { Status, createReading } from '../../domain/status.js';
import { cleanText } from './clean-text.js';

/** @param {number} code */
const levelFor = (code) => (code === 100 ? Status.OK : code === 200 ? Status.MAINTENANCE : code >= 500 ? Status.DOWN : Status.MINOR);

/** @param {any} json */
export function parseStatusIo(json) {
  const code = Number(json?.result?.status_overall?.status_code);
  if (!code) throw new Error('unexpected format');
  const details = (json.result.status ?? [])
    .filter((c) => Number(c.status_code) !== 100)
    .slice(0, 4)
    .map((c) => cleanText(c.name));
  return createReading({ state: levelFor(code), details });
}

/** @type {import('../../application/ports.js').ProviderAdapter} */
export default {
  kind: 'statusio',
  read: async (service, http) => parseStatusIo(await http.json(/** @type {string} */ (service.url))),
};
