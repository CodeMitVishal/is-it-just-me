// @ts-check
// For companies that publish no public live status (e.g. Microsoft Teams). Never fetches anything.
import { Status, createReading } from '../../domain/status.js';

/** @type {import('../../application/ports.js').ProviderAdapter} */
export default {
  kind: 'none',
  read: async () => createReading({ state: Status.UNKNOWN, noFeed: true }),
};
