// @ts-check
// Registry of provider adapters. To support a new status-page format:
//   1. add a file in this folder exporting { kind, read }
//   2. add it to the list below
//   3. use that "kind" in config/services.json
import statuspage from './statuspage.js';
import azureDevOps from './azure-devops.js';
import googleIncidents from './google-incidents.js';
import awsHealth from './aws-health.js';
import azureRss from './azure-rss.js';
import slack from './slack.js';
import statusIo from './statusio.js';
import stripe from './stripe.js';
import noFeed from './no-feed.js';

const ALL = [statuspage, azureDevOps, googleIncidents, awsHealth, azureRss, slack, statusIo, stripe, noFeed];

/** @returns {Map<string, import('../../application/ports.js').ProviderAdapter>} */
export function createAdapterRegistry() {
  return new Map(ALL.map((a) => [a.kind, a]));
}
