// @ts-check
// Azure DevOps public health API.
import { Status, createReading } from '../../domain/status.js';
import { cleanText } from './clean-text.js';

const HEALTH = { healthy: Status.OK, advisory: Status.MINOR, degraded: Status.MINOR, unhealthy: Status.DOWN };

/** @param {any} json */
export function parseAzureDevOps(json) {
  const state = HEALTH[/** @type {keyof HEALTH} */ (String(json?.status?.health ?? '').toLowerCase())];
  if (!state) throw new Error('unexpected health');

  const details = [];
  if (state !== Status.OK) {
    for (const svc of json.services ?? []) {
      const bad = (svc.geographies ?? []).filter((g) => g.health !== 'healthy').map((g) => cleanText(g.name || g.id, 30));
      if (bad.length) details.push(`${cleanText(svc.id)}: ${bad.slice(0, 4).join(', ')}`);
    }
    if (!details.length && json.status.message) details.push(cleanText(json.status.message));
  }
  return createReading({ state, details });
}

/** @type {import('../../application/ports.js').ProviderAdapter} */
export default {
  kind: 'azdo',
  read: async (service, http) => parseAzureDevOps(await http.json(/** @type {string} */ (service.url))),
};
