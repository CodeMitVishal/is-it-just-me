// @ts-check
// Stripe status API (/current).
import { Status, createReading } from '../../domain/status.js';
import { cleanText } from './clean-text.js';

const LARGE_STATUS = { up: Status.OK, degraded: Status.MINOR, down: Status.DOWN };

/** @param {any} json */
export function parseStripe(json) {
  const state = LARGE_STATUS[/** @type {keyof LARGE_STATUS} */ (String(json?.largestatus ?? ''))];
  if (!state) throw new Error('unexpected format');
  return createReading({ state, details: [cleanText(json.message)] });
}

/** @type {import('../../application/ports.js').ProviderAdapter} */
export default {
  kind: 'stripe',
  read: async (service, http) => parseStripe(await http.json(/** @type {string} */ (service.url))),
};
