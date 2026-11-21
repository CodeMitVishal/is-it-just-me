// @ts-check
// Azure status RSS feed. It lists only active incidents: empty feed = working.
import { Status, createReading } from '../../domain/status.js';
import { cleanText } from './clean-text.js';

/** @param {string} xml */
export function parseAzureRss(xml) {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
  const details = items.slice(0, 4).map((m) => cleanText((m[1].match(/<title>([\s\S]*?)<\/title>/) ?? [])[1]));
  return createReading({ state: items.length ? Status.MINOR : Status.OK, details });
}

/** @type {import('../../application/ports.js').ProviderAdapter} */
export default {
  kind: 'azure',
  read: async (service, http) => parseAzureRss(await http.text(/** @type {string} */ (service.url))),
};
