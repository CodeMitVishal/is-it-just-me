// @ts-check
// AWS Health public "current events" (served as UTF-16 JSON; the HTTP client decodes it).
import { Status, createReading, worse } from '../../domain/status.js';
import { cleanText } from './clean-text.js';

const MAX_AGE_DAYS = 14; // very old, long-running notices would make AWS look broken forever

/**
 * @param {string} text
 * @param {Date} now
 */
export function parseAwsHealth(text, now) {
  const events = text.trim() ? JSON.parse(text) : [];
  if (!Array.isArray(events)) throw new Error('unexpected format');
  const cutoff = now.getTime() / 1000 - MAX_AGE_DAYS * 86400;

  let state = Status.OK;
  const details = [];
  for (const e of events) {
    if (Number(e.date) < cutoff) continue;
    const level = { 2: Status.MINOR, 3: Status.DOWN }[Number(e.status)];
    if (!level) continue;
    state = worse(state, level);
    details.push(`${cleanText(e.service_name, 60)} (${cleanText(e.region_name, 40)}): ${cleanText(e.summary, 120)}`);
  }
  return createReading({ state, details });
}

/** @type {import('../../application/ports.js').ProviderAdapter} */
export default {
  kind: 'aws',
  read: async (service, http) => parseAwsHealth(await http.text(/** @type {string} */ (service.url)), new Date()),
};
