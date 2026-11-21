// @ts-check
// Composition root: the only place that knows about concrete implementations and file paths.
// Run with: npm run collect   (or: node collector/main.js)
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateCatalog } from './domain/catalog.js';
import { collectStatuses } from './application/collect-statuses.js';
import { createAdapterRegistry } from './adapters/providers/index.js';
import { createHttpClient } from './infrastructure/http-client.js';
import { readJson, createHistoryStore } from './infrastructure/file-system.js';
import { createStatusJsonPublisher } from './infrastructure/status-json-publisher.js';
import { createAtomFeedPublisher } from './infrastructure/atom-feed-publisher.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE_URL = (process.env.SITE_URL || 'https://example.github.io/is-it-just-me/').replace(/\/?$/, '/');

const adapters = createAdapterRegistry();
const catalog = validateCatalog(await readJson(path.join(ROOT, 'config/services.json')), { knownKinds: [...adapters.keys()] });

await collectStatuses({
  catalog,
  adapters,
  http: createHttpClient(),
  historyStore: createHistoryStore(path.join(ROOT, 'data/history.json')),
  publishers: [
    createStatusJsonPublisher(path.join(ROOT, 'web/data/status.json')),
    createAtomFeedPublisher({ siteRoot: path.join(ROOT, 'web'), siteUrl: SITE_URL }),
  ],
  logger: { info: (m) => console.log(m), warn: (m) => console.warn(m) },
});
