// @ts-check
// Composition root: creates every piece, connects them, starts the live checks.
// This is the only file that knows about all layers.
//
// How the page gets its data (no backend):
//   1. load catalog.json (the list of services) from this site
//   2. with the visitor's permission, their browser reads each company's public status feed
//      directly — on page load and every 5 minutes while the page is visible
import { createLocalStore } from './infrastructure/local-store.js';
import { createCatalogSource } from './infrastructure/catalog-source.js';
import { createLiveSource } from './infrastructure/live-source.js';
import { createBrowserNotifier } from './infrastructure/browser-notifier.js';
import { normalizeCatalog } from './domain/catalog.js';
import { statesById } from './domain/changes.js';
import { checkLive } from './application/live-check.js';
import { createLiveConsent } from './application/live-consent.js';
import { createLiveUpdates, LIVE_INTERVAL_MS } from './application/live-updates.js';
import { createFollows } from './application/follows.js';
import { createChangeAlerts } from './application/change-alerts.js';
import { createPreferences } from './application/preferences.js';
import { createI18n } from './i18n/i18n.js';
import { byId, prefersReducedMotion, replayClass } from './ui/dom.js';
import { STATUS_LABEL, answerKeys } from './ui/messages.js';
import { createAppView } from './ui/app-view.js';
import { translatePage } from './ui/components/static-text.js';
import { mountDisplayPanel, syncLiveSwitch } from './ui/components/display-panel.js';
import { mountConsentCard } from './ui/components/consent-card.js';
import { mountSearchBox, renderQuickPicks } from './ui/components/search-box.js';
import { createDetailsDialog } from './ui/components/details-dialog.js';
import { syncFollowButtons } from './ui/components/service-row.js';
import { showToast } from './ui/components/toast.js';

const CLOCK_MS = 30_000;

// ---- Infrastructure ----
const store = createLocalStore();
const catalogSource = createCatalogSource('catalog.json');
const liveSource = createLiveSource();
const notifier = createBrowserNotifier();

// ---- Application ----
const root = document.documentElement;
const preferences = createPreferences(store, {
  theme: root.dataset.theme ?? 'light',
  font: root.dataset.font ?? 'modern',
  lang: root.lang || 'en',
});
const follows = createFollows(store);
const changeAlerts = createChangeAlerts(store, follows);
const consent = createLiveConsent(store);
const i18n = createI18n(preferences.get('lang'));

// ---- View state ----
/** @type {import('./ui/context.js').ViewState} */
const state = { snapshot: null, previousStates: null, filter: 'all', query: '', onlyProblems: false, live: initialLiveStatus() };
const update = (/** @type {Partial<typeof state>} */ patch) => { Object.assign(state, patch); view.render(state); };

function initialLiveStatus() {
  const choice = consent.get();
  return choice === 'granted' ? 'checking' : choice === 'denied' ? 'off' : 'needs-consent';
}

// ---- UI ----
/** @type {import('./ui/context.js').UiActions} */
const actions = {
  openDetails: (service) => dialog.open(service),
  toggleFollow,
  setQuery: (query) => update({ query }),
  setFilter: (filter) => update({ filter }),
  setOnlyProblems: (onlyProblems) => update({ onlyProblems }),
  setLanguage(lang) {
    i18n.setLang(lang);
    translatePage(i18n.t);
    view.render(state);
  },
};
/** @type {import('./ui/context.js').UiContext} */
const ctx = { i18n, follows, actions };
const view = createAppView(ctx, { notificationsEnabled: notifier.isEnabled, consentChoice: consent.get });
const dialog = createDetailsDialog(ctx);
const search = mountSearchBox(ctx);

translatePage(i18n.t);
mountDisplayPanel({ preferences, onLanguageChange: actions.setLanguage, onLiveChange: (on) => (on ? allowLive() : stopLive()) });
mountConsentCard({ onAllow: allowLive, onDeny: stopLive });
syncLiveSwitch(consent.get());
byId('onlyProblems').addEventListener('change', (e) => actions.setOnlyProblems(/** @type {HTMLInputElement} */ (e.target).checked));
byId('meetBtn').addEventListener('click', () => {
  actions.setFilter('meet');
  byId('allSec').scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
});

// ---- Live checks ----
const liveUpdates = createLiveUpdates({
  consent,
  isVisible: () => document.visibilityState === 'visible',
  run: runLiveCheck,
});

/** One live check: every browser-readable provider, read directly by this browser. */
async function runLiveCheck() {
  if (!state.snapshot) return;
  if (state.live !== 'done') update({ live: 'checking' });
  const result = await checkLive(state.snapshot.services, liveSource);
  if (result.checked === 0) {
    if (state.live !== 'done') update({ live: 'failed' }); // offline: keep the last good results if any
    else showToast(i18n.t('liveFailed'));
    return;
  }
  update({
    previousStates: state.live === 'done' ? statesById(state.snapshot.services) : null,
    snapshot: { generatedAt: result.checkedAt, services: result.services },
    live: 'done',
  });
  announceChanges(result.services);
}

function allowLive() {
  consent.grant();
  syncLiveSwitch(consent.get());
  update({ live: 'checking' });
  liveUpdates.tick(true);
}

function stopLive() {
  consent.deny();
  syncLiveSwitch(consent.get());
  // Forget the live results: without permission the page shows no third-party data.
  if (state.snapshot) state.snapshot = { ...state.snapshot, services: state.snapshot.services.map((s) => ({ ...s, state: 'unknown', details: [], checked: false })) };
  update({ live: 'off', previousStates: null });
}

/**
 * @param {import('./domain/status.js').Service} service
 * @param {HTMLElement} [source]
 */
async function toggleFollow(service, source) {
  const on = follows.toggle(service.id);
  syncFollowButtons(service.id, on, i18n.t);
  if (source && !source.classList.contains('btn')) replayClass(source, 'bump');
  showToast(i18n.t(on ? 'toastFollow' : 'toastUnfollow', { name: service.name }));
  // Ask for notification permission once, the first time someone follows a service.
  if (on && notifier.canAsk() && !(await notifier.requestPermission())) showToast(i18n.t('toastNoNotif'));
  view.renderFollowing(state);
}

/** Tell the visitor about changes to services they follow. */
function announceChanges(/** @type {import('./domain/status.js').Service[]} */ services) {
  for (const { service } of changeAlerts.check(services)) {
    const title = `${service.name}: ${i18n.t(STATUS_LABEL[service.state])}`;
    showToast(title);
    notifier.show(title, i18n.t(answerKeys(service)[0], { name: service.name }), `iijm-${service.id}`);
  }
}

async function start() {
  try {
    const services = normalizeCatalog(await catalogSource.fetchCatalog());
    update({ snapshot: { generatedAt: new Date().toISOString(), services } });
    renderQuickPicks(services, search.setValue);
  } catch {
    update({ snapshot: { generatedAt: new Date().toISOString(), services: [] }, live: 'failed' }); // show the error headline
    return;
  }
  liveUpdates.tick(true); // first check right away (only if permitted)
}

start();
setInterval(() => liveUpdates.tick(), LIVE_INTERVAL_MS / 5); // checks often; tick() itself waits 5 minutes between runs
document.addEventListener('visibilitychange', () => liveUpdates.tick()); // catch up when the tab comes back
setInterval(() => view.renderFreshness(state), CLOCK_MS);
