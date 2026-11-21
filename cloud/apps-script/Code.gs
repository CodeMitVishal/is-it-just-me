// GENERATED FILE — do not edit. Built by tools/build-apps-script.js from collector/ and config/.
// Paste this whole file into Google Apps Script as Code.gs. See README → "Cloud updater".
/* eslint-disable */

const CATALOG = [{"id":"teams","name":"Microsoft Teams","cat":"meet","kind":"none","page":"https://status.cloud.microsoft/","aka":"msteams chat call meeting","icon":"icons/teams.ico"},{"id":"m365","name":"Microsoft 365","sub":"Outlook, Word, Excel, SharePoint","cat":"work","kind":"none","page":"https://status.cloud.microsoft/","aka":"office outlook email sharepoint onedrive o365","icon":"icons/m365.ico"},{"id":"zoom","name":"Zoom","cat":"meet","kind":"statuspage","url":"https://www.zoomstatus.com/api/v2/summary.json","page":"https://status.zoom.us/","aka":"meeting call video","icon":"icons/zoom.ico"},{"id":"slack","name":"Slack","cat":"meet","kind":"slack","url":"https://slack-status.com/api/v2.0.0/current","page":"https://slack-status.com/","aka":"chat huddle","icon":"icons/slack.png"},{"id":"gworkspace","name":"Google Workspace","sub":"Meet, Gmail, Drive, Calendar","cat":"meet","kind":"gcpjson","url":"https://www.google.com/appsstatus/dashboard/incidents.json","page":"https://www.google.com/appsstatus/dashboard/","aka":"google meet gmail drive docs calendar","icon":"icons/gworkspace.ico"},{"id":"discord","name":"Discord","cat":"meet","kind":"statuspage","url":"https://discordstatus.com/api/v2/summary.json","page":"https://discordstatus.com/","aka":"chat voice","icon":"icons/discord.ico"},{"id":"webex","name":"Webex","cat":"meet","kind":"none","page":"https://status.webex.com/","aka":"cisco meeting call","icon":"icons/webex.ico"},{"id":"azuredevops","name":"Azure DevOps","sub":"Repos, Pipelines, Boards","cat":"dev","kind":"azdo","url":"https://status.dev.azure.com/_apis/status/health?api-version=6.0-preview.1","page":"https://status.dev.azure.com/","aka":"ado vsts pipelines boards repos","icon":"icons/azuredevops.ico"},{"id":"github","name":"GitHub","cat":"dev","kind":"statuspage","url":"https://www.githubstatus.com/api/v2/summary.json","page":"https://www.githubstatus.com/","aka":"git copilot actions","icon":"icons/github.ico"},{"id":"gitlab","name":"GitLab","cat":"dev","kind":"statusio","url":"https://status.gitlab.com/1.0/status/5b36dc6502d06804c08349f7","page":"https://status.gitlab.com/","aka":"git","icon":"icons/gitlab.png"},{"id":"bitbucket","name":"Bitbucket","cat":"dev","kind":"statuspage","url":"https://bitbucket.status.atlassian.com/api/v2/summary.json","page":"https://bitbucket.status.atlassian.com/","aka":"git","icon":"icons/bitbucket.png"},{"id":"atlassian","name":"Atlassian","sub":"Jira, Confluence, Trello","cat":"dev","kind":"statuspage","url":"https://status.atlassian.com/api/v2/summary.json","page":"https://status.atlassian.com/","aka":"jira confluence trello","icon":"icons/atlassian.png"},{"id":"circleci","name":"CircleCI","cat":"dev","kind":"statuspage","url":"https://status.circleci.com/api/v2/summary.json","page":"https://status.circleci.com/","aka":"ci build","icon":"icons/circleci.ico"},{"id":"npm","name":"npm","cat":"dev","kind":"statuspage","url":"https://status.npmjs.org/api/v2/summary.json","page":"https://status.npmjs.org/","aka":"node packages registry","icon":"icons/npm.png"},{"id":"docker","name":"Docker","sub":"Docker Hub","cat":"dev","kind":"statuspage","url":"https://www.dockerstatus.com/api/v2/summary.json","page":"https://www.dockerstatus.com/","aka":"containers hub registry","icon":"icons/docker.png"},{"id":"vercel","name":"Vercel","cat":"dev","kind":"statuspage","url":"https://www.vercel-status.com/api/v2/summary.json","page":"https://www.vercel-status.com/","aka":"hosting deploy","icon":"icons/vercel.png"},{"id":"sentry","name":"Sentry","cat":"dev","kind":"statuspage","url":"https://status.sentry.io/api/v2/summary.json","page":"https://status.sentry.io/","aka":"errors monitoring","icon":"icons/sentry.ico"},{"id":"linear","name":"Linear","cat":"dev","kind":"statuspage","url":"https://linearstatus.com/api/v2/summary.json","page":"https://linearstatus.com/","aka":"issues tickets","icon":"icons/linear.png"},{"id":"aws","name":"AWS","sub":"Amazon Web Services","cat":"cloud","kind":"aws","url":"https://health.aws.amazon.com/public/currentevents","page":"https://health.aws.amazon.com/health/status","aka":"amazon ec2 s3 lambda","icon":"icons/aws.png"},{"id":"azure","name":"Microsoft Azure","cat":"cloud","kind":"azure","url":"https://azure.status.microsoft/en-us/status/feed/","page":"https://azure.status.microsoft/en-us/status","aka":"azure cloud"},{"id":"gcp","name":"Google Cloud","sub":"GCP","cat":"cloud","kind":"gcpjson","url":"https://status.cloud.google.com/incidents.json","page":"https://status.cloud.google.com/","aka":"gcp bigquery gke","icon":"icons/gcp.png"},{"id":"cloudflare","name":"Cloudflare","cat":"cloud","kind":"statuspage","url":"https://www.cloudflarestatus.com/api/v2/summary.json","page":"https://www.cloudflarestatus.com/","aka":"cdn dns workers","icon":"icons/cloudflare.png"},{"id":"digitalocean","name":"DigitalOcean","cat":"cloud","kind":"statuspage","url":"https://status.digitalocean.com/api/v2/summary.json","page":"https://status.digitalocean.com/","aka":"droplets","icon":"icons/digitalocean.png"},{"id":"snowflake","name":"Snowflake","cat":"cloud","kind":"statuspage","url":"https://status.snowflake.com/api/v2/summary.json","page":"https://status.snowflake.com/","aka":"data warehouse","icon":"icons/snowflake.png"},{"id":"mongodb","name":"MongoDB Atlas","cat":"cloud","kind":"statuspage","url":"https://status.mongodb.com/api/v2/summary.json","page":"https://status.mongodb.com/","aka":"database","icon":"icons/mongodb.png"},{"id":"openai","name":"OpenAI","sub":"ChatGPT, API","cat":"ai","kind":"statuspage","url":"https://status.openai.com/api/v2/summary.json","page":"https://status.openai.com/","aka":"chatgpt gpt","icon":"icons/openai.png"},{"id":"anthropic","name":"Claude","sub":"Anthropic","cat":"ai","kind":"statuspage","url":"https://status.claude.com/api/v2/summary.json","page":"https://status.claude.com/","aka":"anthropic","icon":"icons/anthropic.png"},{"id":"gusto","name":"Gusto","sub":"Payroll","cat":"hr","kind":"statuspage","url":"https://status.gusto.com/api/v2/summary.json","page":"https://status.gusto.com/","aka":"payroll","icon":"icons/gusto.ico"},{"id":"rippling","name":"Rippling","sub":"HR, Payroll","cat":"hr","kind":"statuspage","url":"https://status.rippling.com/api/v2/summary.json","page":"https://status.rippling.com/","aka":"payroll hris","icon":"icons/rippling.png"},{"id":"greenhouse","name":"Greenhouse","sub":"Hiring","cat":"hr","kind":"statuspage","url":"https://status.greenhouse.io/api/v2/summary.json","page":"https://status.greenhouse.io/","aka":"recruiting ats","icon":"icons/greenhouse.png"},{"id":"lever","name":"Lever","sub":"Hiring","cat":"hr","kind":"statuspage","url":"https://status.lever.co/api/v2/summary.json","page":"https://status.lever.co/","aka":"recruiting ats","icon":"icons/lever.png"},{"id":"workday","name":"Workday","sub":"HR, Payroll","cat":"hr","kind":"none","page":"https://status.workday.com/","aka":"hris payroll","icon":"icons/workday.ico"},{"id":"notion","name":"Notion","cat":"work","kind":"statuspage","url":"https://www.notion-status.com/api/v2/summary.json","page":"https://www.notion-status.com/","aka":"docs wiki notes","icon":"icons/notion.png"},{"id":"asana","name":"Asana","cat":"work","kind":"statuspage","url":"https://status.asana.com/api/v2/summary.json","page":"https://status.asana.com/","aka":"tasks projects","icon":"icons/asana.ico"},{"id":"smartsheet","name":"Smartsheet","cat":"work","kind":"statuspage","url":"https://status.smartsheet.com/api/v2/summary.json","page":"https://status.smartsheet.com/","aka":"sheets projects","icon":"icons/smartsheet.png"},{"id":"miro","name":"Miro","cat":"work","kind":"statuspage","url":"https://status.miro.com/api/v2/summary.json","page":"https://status.miro.com/","aka":"whiteboard","icon":"icons/miro.png"},{"id":"figma","name":"Figma","cat":"work","kind":"statuspage","url":"https://status.figma.com/api/v2/summary.json","page":"https://status.figma.com/","aka":"design figjam","icon":"icons/figma.png"},{"id":"box","name":"Box","cat":"work","kind":"statuspage","url":"https://status.box.com/api/v2/summary.json","page":"https://status.box.com/","aka":"files storage","icon":"icons/box.png"},{"id":"dropbox","name":"Dropbox","cat":"work","kind":"statuspage","url":"https://status.dropbox.com/api/v2/summary.json","page":"https://status.dropbox.com/","aka":"files storage","icon":"icons/dropbox.png"},{"id":"hubspot","name":"HubSpot","cat":"work","kind":"statuspage","url":"https://status.hubspot.com/api/v2/summary.json","page":"https://status.hubspot.com/","aka":"crm marketing","icon":"icons/hubspot.png"},{"id":"twilio","name":"Twilio","sub":"SMS, Voice","cat":"work","kind":"statuspage","url":"https://status.twilio.com/api/v2/summary.json","page":"https://status.twilio.com/","aka":"sms voice","icon":"icons/twilio.png"},{"id":"sendgrid","name":"SendGrid","sub":"Email delivery","cat":"work","kind":"statuspage","url":"https://status.twilio.com/api/v2/summary.json","page":"https://status.sendgrid.com/","aka":"email","icon":"icons/sendgrid.png"},{"id":"stripe","name":"Stripe","sub":"Payments","cat":"work","kind":"stripe","url":"https://status.stripe.com/current","page":"https://status.stripe.com/","aka":"payments","icon":"icons/stripe.ico"}];

const __modules = {};

// ----- collector/domain/catalog.js -----
__modules['collector/domain/catalog.js'] = (function () {
// Domain: the list of services we watch, and the rules every entry must follow.

/**
 * @typedef {object} ServiceDefinition
 * @property {string} id        lowercase id, used in URLs and file names
 * @property {string} name      display name
 * @property {string} [sub]     short description, e.g. "Meet, Gmail, Drive"
 * @property {string} [aka]     extra search words
 * @property {Category} cat     group shown on the site
 * @property {string} kind      which provider adapter reads it
 * @property {string} [url]     machine-readable status endpoint (https)
 * @property {string} page      official human status page (https)
 * @property {string} [icon]    path of the official icon inside web/, e.g. "icons/zoom.png"
 */

/** @typedef {'meet' | 'dev' | 'cloud' | 'ai' | 'hr' | 'work'} Category */
const CATEGORIES = Object.freeze(['meet', 'dev', 'cloud', 'ai', 'hr', 'work']);

const ID = /^[a-z0-9-]{1,40}$/;
const ICON_PATH = /^icons\/[a-z0-9-]{1,40}\.(png|ico|svg|webp|jpg)$/;
const isHttps = (/** @type {unknown} */ u) => typeof u === 'string' && u.startsWith('https://');

/**
 * Validates the whole catalog. Throws with a clear message on the first bad entry,
 * so a typo in config fails the build instead of shipping a broken page.
 * @param {unknown} entries
 * @param {{ knownKinds: string[] }} options
 * @returns {ServiceDefinition[]}
 */
function validateCatalog(entries, { knownKinds }) {
  if (!Array.isArray(entries) || entries.length === 0) throw new Error('catalog must be a non-empty array');
  const seen = new Set();
  for (const s of entries) {
    const where = `catalog entry "${s?.id ?? '?'}"`;
    if (!ID.test(s?.id ?? '')) throw new Error(`${where}: id must match ${ID}`);
    if (seen.has(s.id)) throw new Error(`${where}: duplicate id`);
    seen.add(s.id);
    if (typeof s.name !== 'string' || !s.name.trim()) throw new Error(`${where}: name is required`);
    if (!CATEGORIES.includes(s.cat)) throw new Error(`${where}: cat must be one of ${CATEGORIES.join(', ')}`);
    if (!knownKinds.includes(s.kind)) throw new Error(`${where}: unknown kind "${s.kind}"`);
    if (!isHttps(s.page)) throw new Error(`${where}: page must be an https URL`);
    if (s.kind !== 'none' && !isHttps(s.url)) throw new Error(`${where}: url must be an https URL`);
    if (s.icon !== undefined && !ICON_PATH.test(s.icon)) throw new Error(`${where}: icon must match ${ICON_PATH}`);
  }
  return /** @type {ServiceDefinition[]} */ (entries);
}

return { CATEGORIES, ICON_PATH, validateCatalog };
})();

// ----- collector/domain/feeds.js -----
__modules['collector/domain/feeds.js'] = (function () {
// Domain: Atom (RSS) feeds built from the state-change history. Pure — returns file contents;
// the infrastructure decides where they are written (disk, or a GitHub commit).

const WORD = { ok: 'Working fine', minor: 'Having some trouble', down: 'Down', maint: 'Planned maintenance' };
const xml = (/** @type {unknown} */ s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c] ?? c);

/** @typedef {{ t: string, title: string, text: string, link: string }} FeedEntry */

/**
 * Renders one Atom document.
 * @param {{ siteUrl: string, id: string, title: string, entries: FeedEntry[], now: string }} feed
 */
function renderAtom({ siteUrl, id, title, entries, now }) {
  const self = `${siteUrl}feeds/${id}.xml`;
  const items = entries
    .map((e) => `<entry><title>${xml(e.title)}</title><id>${xml(`${siteUrl}${id}/${e.t}`)}</id><updated>${e.t}</updated><link href="${xml(e.link)}"/><summary>${xml(e.text)}</summary></entry>`)
    .join('\n');
  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
<title>${xml(title)}</title>
<id>${xml(self)}</id>
<link rel="self" href="${xml(self)}"/>
<link href="${xml(siteUrl)}"/>
<updated>${entries[0]?.t ?? now}</updated>
${items}
</feed>
`;
}

/**
 * All feeds: one per service plus "all".
 * @param {import('./snapshot.js').Snapshot} snapshot
 * @param {import('./history.js').History} history
 * @param {string} siteUrl  ends with "/"
 * @returns {{ path: string, content: string }[]}  paths relative to the site root, e.g. "feeds/zoom.xml"
 */
function buildFeeds(snapshot, history, siteUrl) {
  const files = [];
  const all = [];
  for (const s of snapshot.services) {
    const entries = (history[s.id]?.events ?? []).map((e) => {
      const word = WORD[/** @type {keyof WORD} */ (e.state)] ?? e.state;
      return { t: e.t, link: s.page, title: `${s.name}: ${word}`, text: e.text || word };
    });
    all.push(...entries);
    files.push({ path: `feeds/${s.id}.xml`, content: renderAtom({ siteUrl, id: s.id, title: `${s.name} status`, entries, now: snapshot.generatedAt }) });
  }
  all.sort((a, b) => (a.t < b.t ? 1 : -1));
  files.push({ path: 'feeds/all.xml', content: renderAtom({ siteUrl, id: 'all', title: 'All services status', entries: all.slice(0, 100), now: snapshot.generatedAt }) });
  return files;
}

return { renderAtom, buildFeeds };
})();

// ----- collector/domain/status.js -----
__modules['collector/domain/status.js'] = (function () {
// Domain: what a "status" is. Pure, no I/O, no dependencies.

/** @typedef {'ok' | 'maint' | 'minor' | 'down' | 'unknown'} StatusLevel */

const Status = Object.freeze({
  OK: /** @type {StatusLevel} */ ('ok'),
  MAINTENANCE: /** @type {StatusLevel} */ ('maint'),
  MINOR: /** @type {StatusLevel} */ ('minor'),
  DOWN: /** @type {StatusLevel} */ ('down'),
  UNKNOWN: /** @type {StatusLevel} */ ('unknown'),
});

/** Higher number = worse. UNKNOWN is not ranked: it means "no information". */
const SEVERITY = Object.freeze({ ok: 0, maint: 1, minor: 2, down: 3 });

/** @param {string} level */
const isKnown = (level) => Object.prototype.hasOwnProperty.call(SEVERITY, level);

/** Returns the worse of two known levels. */
function worse(/** @type {StatusLevel} */ a, /** @type {StatusLevel} */ b) {
  return SEVERITY[b] > SEVERITY[a] ? b : a;
}

/**
 * The result of reading one provider.
 * @typedef {{ state: StatusLevel, details: string[], noFeed?: boolean }} Reading
 */

/**
 * Creates a validated reading. Adapters must return their result through this.
 * @param {{ state: StatusLevel, details?: string[], noFeed?: boolean }} input
 * @returns {Reading}
 */
function createReading({ state, details = [], noFeed = false }) {
  if (!isKnown(state) && state !== Status.UNKNOWN) throw new Error(`invalid status "${state}"`);
  // Working services need no explanation; keep the payload small.
  const kept = state === Status.OK ? [] : details.filter(Boolean).slice(0, 4);
  return Object.freeze({ state, details: kept, ...(noFeed ? { noFeed: true } : {}) });
}

/** A reading for when the provider could not be read. */
const unknownReading = () => createReading({ state: Status.UNKNOWN });

return { Status, isKnown, worse, createReading, unknownReading };
})();

// ----- collector/domain/history.js -----
__modules['collector/domain/history.js'] = (function () {
// Domain: remembering when a service changed state. Pure functions; returns new objects.
const { Status } = __modules['collector/domain/status.js'];
/**
 * @typedef {{ t: string, state: import('./status.js').StatusLevel, text: string }} HistoryEvent
 * @typedef {{ state: import('./status.js').StatusLevel, since: string, events: HistoryEvent[] }} ServiceHistory
 * @typedef {Record<string, ServiceHistory>} History
 */

const MAX_EVENTS = 20;

/**
 * Applies the latest readings to the history.
 * - "unknown" readings are ignored (a failed fetch is not a state change).
 * - The first time we see a service we only record its state, not an event.
 * @param {History} history
 * @param {{ id: string, reading: import('./status.js').Reading }[]} results
 * @param {Date} now
 * @returns {{ history: History, changed: boolean }}
 */
function applyReadings(history, results, now) {
  const next = JSON.parse(JSON.stringify(history ?? {})); // deep copy (works in Node and Apps Script)
  const at = now.toISOString();
  let changed = false;

  for (const { id, reading } of results) {
    if (reading.state === Status.UNKNOWN) continue;
    const entry = next[id];
    if (!entry) {
      next[id] = { state: reading.state, since: at, events: [] };
      changed = true;
    } else if (entry.state !== reading.state) {
      entry.events = [{ t: at, state: reading.state, text: reading.details[0] ?? '' }, ...entry.events].slice(0, MAX_EVENTS);
      entry.state = reading.state;
      entry.since = at;
      changed = true;
    }
  }
  return { history: next, changed };
}

/**
 * When the current state started, but only if we actually saw the change happen.
 * (The first-seen time is just when we started watching, which would be misleading.)
 * @param {ServiceHistory | undefined} entry
 * @returns {string | undefined}
 */
const observedSince = (entry) => (entry && entry.events.length ? entry.since : undefined);

return { applyReadings, observedSince };
})();

// ----- collector/domain/snapshot.js -----
__modules['collector/domain/snapshot.js'] = (function () {
// Domain: the public snapshot written to web/data/status.json.
// This shape is the contract with the website — see docs/DATA_CONTRACT.md.
const { observedSince } = __modules['collector/domain/history.js'];
/**
 * @typedef {object} SnapshotService
 * @property {string} id
 * @property {string} name
 * @property {string} [sub]
 * @property {string} [aka]
 * @property {string} cat
 * @property {string} page
 * @property {string} [icon]      official icon, relative to the site root
 * @property {import('./status.js').StatusLevel} state
 * @property {string[]} details   text written by the provider (English)
 * @property {string} [since]     ISO time the current state began (only if observed)
 * @property {boolean} [noFeed]   provider publishes no public live status
 *
 * @typedef {{ generatedAt: string, services: SnapshotService[] }} Snapshot
 */

/**
 * @param {import('./catalog.js').ServiceDefinition[]} catalog
 * @param {Map<string, import('./status.js').Reading>} readings
 * @param {import('./history.js').History} history
 * @param {Date} now
 * @returns {Snapshot}
 */
function buildSnapshot(catalog, readings, history, now) {
  const services = catalog.map((def) => {
    const reading = readings.get(def.id);
    if (!reading) throw new Error(`missing reading for ${def.id}`);
    const since = reading.state === 'unknown' ? undefined : observedSince(history[def.id]);
    return {
      id: def.id,
      name: def.name,
      ...(def.sub ? { sub: def.sub } : {}),
      ...(def.aka ? { aka: def.aka } : {}),
      cat: def.cat,
      page: def.page,
      ...(def.icon ? { icon: def.icon } : {}),
      state: reading.state,
      details: [...reading.details],
      ...(since ? { since } : {}),
      ...(reading.noFeed ? { noFeed: true } : {}),
    };
  });
  return { generatedAt: now.toISOString(), services };
}

return { buildSnapshot };
})();

// ----- collector/application/collect-statuses.js -----
__modules['collector/application/collect-statuses.js'] = (function () {
// Use case: read every service, update history, publish the snapshot.
// Depends only on the domain and on ports passed in (dependency inversion).
const { unknownReading } = __modules['collector/domain/status.js'];
const { applyReadings } = __modules['collector/domain/history.js'];
const { buildSnapshot } = __modules['collector/domain/snapshot.js'];
/**
 * @param {object} deps
 * @param {import('../domain/catalog.js').ServiceDefinition[]} deps.catalog
 * @param {Map<string, import('./ports.js').ProviderAdapter>} deps.adapters   keyed by kind
 * @param {import('./ports.js').HttpClient} deps.http
 * @param {import('./ports.js').HistoryStore} deps.historyStore
 * @param {import('./ports.js').Publisher[]} deps.publishers
 * @param {import('./ports.js').Logger} deps.logger
 * @param {() => Date} [deps.clock]
 * @returns {Promise<import('../domain/snapshot.js').Snapshot>}
 */
async function collectStatuses({ catalog, adapters, http, historyStore, publishers, logger, clock = () => new Date() }) {
  const now = clock();

  // 1. Read all providers in parallel. One failing provider never breaks the others.
  const results = await Promise.all(
    catalog.map(async (service) => ({ id: service.id, reading: await readOne(service, adapters, http, logger) }))
  );

  // 2. Update the change history (pure domain logic).
  const previous = await historyStore.load();
  const { history, changed } = applyReadings(previous, results, now);
  if (changed) {
    await historyStore.save(history);
    logger.info('history changed');
  }

  // 3. Build and publish the snapshot.
  const snapshot = buildSnapshot(catalog, new Map(results.map((r) => [r.id, r.reading])), history, now);
  for (const publisher of publishers) await publisher.publish(snapshot, history);

  logger.info(summaryLine(snapshot));
  return snapshot;
}

/**
 * @param {import('../domain/catalog.js').ServiceDefinition} service
 * @param {Map<string, import('./ports.js').ProviderAdapter>} adapters
 * @param {import('./ports.js').HttpClient} http
 * @param {import('./ports.js').Logger} logger
 */
async function readOne(service, adapters, http, logger) {
  const adapter = adapters.get(service.kind);
  if (!adapter) throw new Error(`no adapter for kind "${service.kind}"`); // catalog validation should prevent this
  try {
    return await adapter.read(service, http);
  } catch (err) {
    logger.warn(`! ${service.id}: ${String(err instanceof Error ? err.message : err).slice(0, 80)}`);
    return unknownReading(); // shown as "Can't check" — never as working
  }
}

/** @param {import('../domain/snapshot.js').Snapshot} snapshot */
function summaryLine(snapshot) {
  const count = (/** @type {string} */ st) => snapshot.services.filter((s) => s.state === st).length;
  return `checked ${snapshot.services.length}: ok ${count('ok')}, minor ${count('minor')}, down ${count('down')}, maint ${count('maint')}, unknown ${count('unknown')}`;
}

return { collectStatuses };
})();

// ----- collector/adapters/providers/clean-text.js -----
__modules['collector/adapters/providers/clean-text.js'] = (function () {
// Security boundary: every string taken from a provider passes through cleanText.
// Strips HTML tags and control characters, decodes basic entities, caps length.

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'" };

/**
 * @param {unknown} value
 * @param {number} [max]
 * @returns {string}
 */
function cleanText(value, max = 180) {
  return String(value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(amp|lt|gt|quot|#39);/g, (_, e) => ENTITIES[/** @type {keyof ENTITIES} */ (e)])
    .replace(/[\u0000-\u001f\u007f<>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

return { cleanText };
})();

// ----- collector/adapters/providers/statuspage.js -----
__modules['collector/adapters/providers/statuspage.js'] = (function () {
// Atlassian Statuspage format (/api/v2/summary.json). Used by most companies.
const { Status, createReading } = __modules['collector/domain/status.js'];
const { cleanText } = __modules['collector/adapters/providers/clean-text.js'];
const INDICATOR = { none: Status.OK, minor: Status.MINOR, major: Status.DOWN, critical: Status.DOWN, maintenance: Status.MAINTENANCE };
const TICKET_ID = /^[A-Z]{2,5}[-\s]?\d{4,}$/; // e.g. "INC20000369" says nothing to a reader

/** Pure parser, exported for tests. @param {any} json */
function parseStatuspage(json) {
  let state = INDICATOR[/** @type {keyof INDICATOR} */ (json?.status?.indicator)];
  if (!state) throw new Error('unexpected indicator');

  const details = [];
  for (const incident of (json.incidents ?? []).slice(0, 4)) {
    const name = cleanText(incident.name);
    if (!TICKET_ID.test(name)) details.push(name);
  }
  for (const m of (json.scheduled_maintenances ?? []).filter((m) => m.status === 'in_progress').slice(0, 2)) {
    details.push(cleanText(m.name));
    if (state === Status.OK) state = Status.MAINTENANCE;
  }
  if (state !== Status.OK && details.length === 0) {
    for (const c of (json.components ?? []).filter((c) => c.status !== 'operational' && !c.group).slice(0, 4)) {
      details.push(cleanText(c.name));
    }
  }
  return createReading({ state, details });
}

/** @type {import('../../application/ports.js').ProviderAdapter} */
const __default = {
  kind: 'statuspage',
  read: async (service, http) => parseStatuspage(await http.json(/** @type {string} */ (service.url))),
};

return { parseStatuspage, default: __default };
})();

// ----- collector/adapters/providers/azure-devops.js -----
__modules['collector/adapters/providers/azure-devops.js'] = (function () {
// Azure DevOps public health API.
const { Status, createReading } = __modules['collector/domain/status.js'];
const { cleanText } = __modules['collector/adapters/providers/clean-text.js'];
const HEALTH = { healthy: Status.OK, advisory: Status.MINOR, degraded: Status.MINOR, unhealthy: Status.DOWN };

/** @param {any} json */
function parseAzureDevOps(json) {
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
const __default = {
  kind: 'azdo',
  read: async (service, http) => parseAzureDevOps(await http.json(/** @type {string} */ (service.url))),
};

return { parseAzureDevOps, default: __default };
})();

// ----- collector/adapters/providers/google-incidents.js -----
__modules['collector/adapters/providers/google-incidents.js'] = (function () {
// Google incidents.json format (Google Cloud and Google Workspace).
// The file is the full incident history; an incident without "end" is still active.
const { Status, createReading, worse } = __modules['collector/domain/status.js'];
const { cleanText } = __modules['collector/adapters/providers/clean-text.js'];
/** @param {any} json */
function parseGoogleIncidents(json) {
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
const __default = {
  kind: 'gcpjson',
  read: async (service, http) => parseGoogleIncidents(await http.json(/** @type {string} */ (service.url))),
};

return { parseGoogleIncidents, default: __default };
})();

// ----- collector/adapters/providers/aws-health.js -----
__modules['collector/adapters/providers/aws-health.js'] = (function () {
// AWS Health public "current events" (served as UTF-16 JSON; the HTTP client decodes it).
const { Status, createReading, worse } = __modules['collector/domain/status.js'];
const { cleanText } = __modules['collector/adapters/providers/clean-text.js'];
const MAX_AGE_DAYS = 14; // very old, long-running notices would make AWS look broken forever

/**
 * @param {string} text
 * @param {Date} now
 */
function parseAwsHealth(text, now) {
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
const __default = {
  kind: 'aws',
  read: async (service, http) => parseAwsHealth(await http.text(/** @type {string} */ (service.url)), new Date()),
};

return { parseAwsHealth, default: __default };
})();

// ----- collector/adapters/providers/azure-rss.js -----
__modules['collector/adapters/providers/azure-rss.js'] = (function () {
// Azure status RSS feed. It lists only active incidents: empty feed = working.
const { Status, createReading } = __modules['collector/domain/status.js'];
const { cleanText } = __modules['collector/adapters/providers/clean-text.js'];
/** @param {string} xml */
function parseAzureRss(xml) {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
  const details = items.slice(0, 4).map((m) => cleanText((m[1].match(/<title>([\s\S]*?)<\/title>/) ?? [])[1]));
  return createReading({ state: items.length ? Status.MINOR : Status.OK, details });
}

/** @type {import('../../application/ports.js').ProviderAdapter} */
const __default = {
  kind: 'azure',
  read: async (service, http) => parseAzureRss(await http.text(/** @type {string} */ (service.url))),
};

return { parseAzureRss, default: __default };
})();

// ----- collector/adapters/providers/slack.js -----
__modules['collector/adapters/providers/slack.js'] = (function () {
// Slack status API v2.
const { Status, createReading, worse } = __modules['collector/domain/status.js'];
const { cleanText } = __modules['collector/adapters/providers/clean-text.js'];
/** @param {any} json */
function parseSlack(json) {
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
const __default = {
  kind: 'slack',
  read: async (service, http) => parseSlack(await http.json(/** @type {string} */ (service.url))),
};

return { parseSlack, default: __default };
})();

// ----- collector/adapters/providers/statusio.js -----
__modules['collector/adapters/providers/statusio.js'] = (function () {
// status.io public API (used by GitLab). Codes: 100 ok, 200 maintenance, 300/400 degraded, 500+ outage.
const { Status, createReading } = __modules['collector/domain/status.js'];
const { cleanText } = __modules['collector/adapters/providers/clean-text.js'];
/** @param {number} code */
const levelFor = (code) => (code === 100 ? Status.OK : code === 200 ? Status.MAINTENANCE : code >= 500 ? Status.DOWN : Status.MINOR);

/** @param {any} json */
function parseStatusIo(json) {
  const code = Number(json?.result?.status_overall?.status_code);
  if (!code) throw new Error('unexpected format');
  const details = (json.result.status ?? [])
    .filter((c) => Number(c.status_code) !== 100)
    .slice(0, 4)
    .map((c) => cleanText(c.name));
  return createReading({ state: levelFor(code), details });
}

/** @type {import('../../application/ports.js').ProviderAdapter} */
const __default = {
  kind: 'statusio',
  read: async (service, http) => parseStatusIo(await http.json(/** @type {string} */ (service.url))),
};

return { parseStatusIo, default: __default };
})();

// ----- collector/adapters/providers/stripe.js -----
__modules['collector/adapters/providers/stripe.js'] = (function () {
// Stripe status API (/current).
const { Status, createReading } = __modules['collector/domain/status.js'];
const { cleanText } = __modules['collector/adapters/providers/clean-text.js'];
const LARGE_STATUS = { up: Status.OK, degraded: Status.MINOR, down: Status.DOWN };

/** @param {any} json */
function parseStripe(json) {
  const state = LARGE_STATUS[/** @type {keyof LARGE_STATUS} */ (String(json?.largestatus ?? ''))];
  if (!state) throw new Error('unexpected format');
  return createReading({ state, details: [cleanText(json.message)] });
}

/** @type {import('../../application/ports.js').ProviderAdapter} */
const __default = {
  kind: 'stripe',
  read: async (service, http) => parseStripe(await http.json(/** @type {string} */ (service.url))),
};

return { parseStripe, default: __default };
})();

// ----- collector/adapters/providers/no-feed.js -----
__modules['collector/adapters/providers/no-feed.js'] = (function () {
// For companies that publish no public live status (e.g. Microsoft Teams). Never fetches anything.
const { Status, createReading } = __modules['collector/domain/status.js'];
/** @type {import('../../application/ports.js').ProviderAdapter} */
const __default = {
  kind: 'none',
  read: async () => createReading({ state: Status.UNKNOWN, noFeed: true }),
};

return { default: __default };
})();

// ----- collector/adapters/providers/index.js -----
__modules['collector/adapters/providers/index.js'] = (function () {
// Registry of provider adapters. To support a new status-page format:
//   1. add a file in this folder exporting { kind, read }
//   2. add it to the list below
//   3. use that "kind" in config/services.json
const statuspage = __modules['collector/adapters/providers/statuspage.js'].default;
const azureDevOps = __modules['collector/adapters/providers/azure-devops.js'].default;
const googleIncidents = __modules['collector/adapters/providers/google-incidents.js'].default;
const awsHealth = __modules['collector/adapters/providers/aws-health.js'].default;
const azureRss = __modules['collector/adapters/providers/azure-rss.js'].default;
const slack = __modules['collector/adapters/providers/slack.js'].default;
const statusIo = __modules['collector/adapters/providers/statusio.js'].default;
const stripe = __modules['collector/adapters/providers/stripe.js'].default;
const noFeed = __modules['collector/adapters/providers/no-feed.js'].default;
const ALL = [statuspage, azureDevOps, googleIncidents, awsHealth, azureRss, slack, statusIo, stripe, noFeed];

/** @returns {Map<string, import('../../application/ports.js').ProviderAdapter>} */
function createAdapterRegistry() {
  return new Map(ALL.map((a) => [a.kind, a]));
}

return { createAdapterRegistry };
})();

// ===================================================================================
// Apps Script runtime: infrastructure + composition root for the cloud updater.
// The collector's domain, use case and provider adapters are bundled above this part
// (see tools/build-apps-script.js) — the same code that runs in Node, unchanged.
//
// Every 15 minutes (time-driven trigger) it:
//   1. reads all public status pages ONCE (UrlFetchApp, on Google's servers)
//   2. updates the change history
//   3. writes data/status.json, data/history.json and feeds/*.xml to the gh-pages branch
//      in ONE commit through the GitHub API → GitHub Pages serves it to every visitor
//
// Setup: put a fine-grained GitHub token (this repo only, "Contents: Read and write") in
// Project Settings → Script properties as GITHUB_TOKEN, then run setup() once.
// ===================================================================================

const CONFIG = Object.freeze({
  repo: 'CodeMitVishal/is-it-just-me',
  branch: 'gh-pages',
  siteUrl: 'https://codemitvishal.github.io/is-it-just-me/',
  everyMinutes: 15, // Apps Script allows 1, 5, 10, 15 or 30
  maxBytes: 8 * 1024 * 1024,
  maxRedirects: 3,
  // Commits are attributed to a bot name with GitHub's private noreply address (no personal email).
  author: { name: 'is-it-just-me bot', email: '37198555+CodeMitVishal@users.noreply.github.com' },
});

// ---------- Entry points (run these from the Apps Script editor) ----------

/** One update. Called by the timer every 15 minutes; you can also run it by hand. */
async function run() {
  const token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  if (!token) throw new Error('Missing script property GITHUB_TOKEN (Project Settings → Script properties).');

  const { validateCatalog } = __modules['collector/domain/catalog.js'];
  const { collectStatuses } = __modules['collector/application/collect-statuses.js'];
  const { createAdapterRegistry } = __modules['collector/adapters/providers/index.js'];

  const adapters = createAdapterRegistry();
  const catalog = validateCatalog(CATALOG, { knownKinds: [...adapters.keys()] });
  const site = createGitHubSite(createGitHubApi(token));

  const snapshot = await collectStatuses({
    catalog,
    adapters,
    http: createGasHttpClient(),
    historyStore: site.historyStore,
    publishers: [site.publisher],
    logger: { info: (m) => console.log(m), warn: (m) => console.warn(m) },
  });
  console.log(`Published ${snapshot.services.length} services at ${snapshot.generatedAt} → ${CONFIG.siteUrl}`);
  return snapshot.generatedAt;
}

/** Run once: installs the 15-minute timer (removes any older timer first). */
function setup() {
  teardown();
  ScriptApp.newTrigger('run').timeBased().everyMinutes(CONFIG.everyMinutes).create();
  console.log(`Timer installed: run() every ${CONFIG.everyMinutes} minutes.`);
}

/** Stops the automatic updates. */
function teardown() {
  for (const trigger of ScriptApp.getProjectTriggers()) {
    if (trigger.getHandlerFunction() === 'run') ScriptApp.deleteTrigger(trigger);
  }
}

// ---------- HttpClient port (UrlFetchApp) ----------

function createGasHttpClient() {
  function text(url) {
    let current = url;
    for (let hop = 0; hop <= CONFIG.maxRedirects; hop++) {
      if (!/^https:\/\//.test(current)) throw new Error('https only');
      const res = UrlFetchApp.fetch(current, {
        muteHttpExceptions: true,
        followRedirects: false, // followed by hand so every hop is checked for https
        headers: { Accept: 'application/json, application/rss+xml, */*' },
      });
      const code = res.getResponseCode();
      if (code >= 300 && code < 400) {
        const headers = res.getHeaders();
        const location = headers.Location || headers.location;
        if (!location) throw new Error(`HTTP ${code} without Location`);
        current = resolveLocation(location, current);
        continue;
      }
      if (code < 200 || code >= 300) throw new Error(`HTTP ${code}`);
      const bytes = res.getContent();
      if (bytes.length > CONFIG.maxBytes) throw new Error('response too large');
      return decodeGasBytes(bytes);
    }
    throw new Error('too many redirects');
  }
  return {
    text: async (url) => text(url),
    json: async (url) => JSON.parse(text(url)),
  };
}

/** Resolves a redirect Location (Apps Script has no URL class). */
function resolveLocation(location, from) {
  if (/^[a-z][a-z0-9+.-]*:/i.test(location)) return location;                          // absolute
  const origin = from.match(/^[a-z]+:\/\/[^/]+/i)[0];
  if (location.startsWith('//')) return from.split(':')[0] + ':' + location;             // protocol-relative
  if (location.startsWith('/')) return origin + location;                               // root-relative
  return from.replace(/[?#].*$/, '').replace(/[^/]*$/, '') + location;                  // path-relative
}

/** UTF-8, or UTF-16 with a byte-order mark (AWS). Apps Script bytes are signed (-128..127). */
function decodeGasBytes(bytes) {
  const b0 = bytes[0] & 255;
  const b1 = bytes[1] & 255;
  const charset = b0 === 0xfe && b1 === 0xff ? 'UTF-16BE' : b0 === 0xff && b1 === 0xfe ? 'UTF-16LE' : 'UTF-8';
  return Utilities.newBlob(bytes).getDataAsString(charset).replace(/^﻿/, '');
}

// ---------- GitHub API (HistoryStore + Publisher ports) ----------

function createGitHubApi(token) {
  return function api(method, path, body) {
    const res = UrlFetchApp.fetch(`https://api.github.com/repos/${CONFIG.repo}${path}`, {
      method,
      muteHttpExceptions: true,
      contentType: 'application/json',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
      ...(body ? { payload: JSON.stringify(body) } : {}),
    });
    const code = res.getResponseCode();
    if (code >= 300) {
      const error = new Error(`GitHub ${method.toUpperCase()} ${path} → ${code}`);
      error.status = code;
      throw error;
    }
    const text = res.getContentText();
    return text ? JSON.parse(text) : null;
  };
}

/**
 * History lives on gh-pages (data/history.json). Everything changed in one run is written in
 * a single commit. The commit has no parent and the branch is force-updated, so gh-pages always
 * holds exactly one commit and the repository never grows.
 */
function createGitHubSite(api) {
  const pending = new Map();

  function readText(path) {
    const file = api('get', `/contents/${path}?ref=${CONFIG.branch}`);
    return Utilities.newBlob(Utilities.base64Decode(file.content)).getDataAsString('UTF-8');
  }

  function commitAll(message) {
    const ref = api('get', `/git/ref/heads/${CONFIG.branch}`);
    const head = api('get', `/git/commits/${ref.object.sha}`);
    const tree = api('post', '/git/trees', {
      base_tree: head.tree.sha, // keep the website files that are already on gh-pages
      tree: [...pending].map(([path, content]) => ({ path, mode: '100644', type: 'blob', content })),
    });
    const stamp = { ...CONFIG.author, date: new Date().toISOString() };
    const commit = api('post', '/git/commits', { message, tree: tree.sha, parents: [], author: stamp, committer: stamp });
    api('patch', `/git/refs/heads/${CONFIG.branch}`, { sha: commit.sha, force: true });
    pending.clear();
  }

  return {
    historyStore: {
      async load() {
        try { return JSON.parse(readText('data/history.json')); } catch (e) { if (e.status === 404) return {}; throw e; }
      },
      async save(history) {
        pending.set('data/history.json', JSON.stringify(history, null, 1) + '\n');
      },
    },
    publisher: {
      async publish(snapshot, history) {
        const { buildFeeds } = __modules['collector/domain/feeds.js'];
        pending.set('data/status.json', JSON.stringify(snapshot));
        for (const file of buildFeeds(snapshot, history, CONFIG.siteUrl)) pending.set(file.path, file.content);
        commitAll(`Update status ${snapshot.generatedAt}`);
      },
    },
  };
}
