// @ts-check
// Composition root: creates every piece, connects them, starts the refresh loop.
// This is the only file that knows about all layers.
import { createLocalStore } from './infrastructure/local-store.js';
import { DATA_BASE } from './config.js';
import { createStatusSource } from './infrastructure/status-source.js';
import { createBrowserNotifier } from './infrastructure/browser-notifier.js';
import { loadStatus } from './application/load-status.js';
import { createFollows } from './application/follows.js';
import { createChangeAlerts } from './application/change-alerts.js';
import { createPreferences } from './application/preferences.js';
import { statesById } from './domain/changes.js';
import { createI18n } from './i18n/i18n.js';
import { byId, prefersReducedMotion, replayClass } from './ui/dom.js';
import { STATUS_LABEL, answerKeys } from './ui/messages.js';
import { createAppView } from './ui/app-view.js';
import { translatePage } from './ui/components/static-text.js';
import { mountDisplayPanel } from './ui/components/display-panel.js';
import { mountSearchBox, renderQuickPicks } from './ui/components/search-box.js';
import { createDetailsDialog } from './ui/components/details-dialog.js';
import { syncFollowButtons } from './ui/components/service-row.js';
import { showToast } from './ui/components/toast.js';

// GitHub Pages caches files for ~10 minutes, and the data changes every ~15 minutes,
// so checking every 5 minutes is plenty — and every visitor reads the same cached copy.
const REFRESH_MS = 5 * 60_000;
const CLOCK_MS = 30_000;

// ---- Infrastructure ----
const store = createLocalStore();
const source = createStatusSource(`${DATA_BASE}data/status.json`);
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
const i18n = createI18n(preferences.get('lang'));

// ---- View state ----
/** @type {import('./ui/context.js').ViewState} */
const state = { snapshot: null, previousStates: null, filter: 'all', query: '', onlyProblems: false };
const update = (/** @type {Partial<typeof state>} */ patch) => { Object.assign(state, patch); view.render(state); };

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
const ctx = { i18n, follows, actions, dataBase: DATA_BASE };
const view = createAppView(ctx, { notificationsEnabled: notifier.isEnabled });
const dialog = createDetailsDialog(ctx);
const search = mountSearchBox(ctx);

translatePage(i18n.t);
mountDisplayPanel({ preferences, onLanguageChange: actions.setLanguage });
byId('onlyProblems').addEventListener('change', (e) => actions.setOnlyProblems(/** @type {HTMLInputElement} */ (e.target).checked));
byId('meetBtn').addEventListener('click', () => {
  actions.setFilter('meet');
  byId('allSec').scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
});

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

async function refresh(/** @type {boolean} */ isFirst) {
  try {
    const snapshot = await loadStatus(source);
    update({ previousStates: state.snapshot ? statesById(state.snapshot.services) : null, snapshot });
    announceChanges(snapshot.services);
    if (isFirst) renderQuickPicks(snapshot.services, search.setValue);
  } catch {
    if (isFirst) view.renderLoadError(); // later failures keep showing the last good data
  }
}

refresh(true);
setInterval(() => refresh(false), REFRESH_MS);
setInterval(() => view.renderFreshness(state), CLOCK_MS);
