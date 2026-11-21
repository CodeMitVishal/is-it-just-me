// @ts-check
// Top of the page: one-sentence answer, the numbers behind it, and how fresh the check is.
import { byId, replayClass } from '../dom.js';
import { statusIcon } from '../icons.js';
import { summarize, isStale } from '../../domain/summary.js';

/** Headline + lede for every moment before a successful live check. */
const NOT_READY = {
  'needs-consent': ['unknown', 'hlNeedsConsent', 'ledeNeedsConsent'],
  off: ['unknown', 'hlLiveOff', 'ledeLiveOff'],
  checking: ['unknown', 'loading', 'ledeChecking'],
  failed: ['unknown', 'loadError', 'loadErrorText'],
};

/**
 * @param {import('../../domain/catalog.js').Snapshot} snapshot
 * @param {import('../context.js').LiveStatus} live
 * @param {import('../../i18n/i18n.js').I18n} i18n
 */
export function renderHero(snapshot, live, i18n) {
  const { t } = i18n;
  const sum = summarize(snapshot.services);
  byId('overline').textContent = t('overline', { n: sum.total });

  if (live !== 'done') {
    const [state, headKey, ledeKey] = NOT_READY[live];
    setHeadline(state, t(headKey));
    byId('lede').textContent = t(ledeKey, { n: snapshot.services.filter((s) => s.live).length });
    byId('updated').textContent = '';
    byId('stale').hidden = true;
    return;
  }

  setHeadline(sum.overall, sum.disrupted ? t('hlProblems', { n: sum.disrupted }) : t('hlAllGood'));
  if (sum.disrupted || sum.maint) {
    const parts = [];
    if (sum.down) parts.push(t('partDown', { n: sum.down }));
    if (sum.minor) parts.push(t('partMinor', { n: sum.minor }));
    if (sum.maint) parts.push(t('partMaint', { n: sum.maint }));
    byId('lede').textContent = `${parts.join(' · ')}. ${t('ledeRest')}`;
  } else {
    byId('lede').textContent = t('ledeAllGood', { n: sum.checkable });
  }
  renderFreshness(snapshot, live, i18n);
}

/** "Checked live 3 minutes ago by your browser" + the stale warning. Re-run every 30 s. */
export function renderFreshness(
  /** @type {import('../../domain/catalog.js').Snapshot} */ snapshot,
  /** @type {import('../context.js').LiveStatus} */ live,
  /** @type {import('../../i18n/i18n.js').I18n} */ i18n,
) {
  if (live !== 'done') return;
  const ago = i18n.relativeTime(snapshot.generatedAt);
  byId('updated').textContent = i18n.t('updatedLive', { t: ago });
  const stale = isStale(snapshot.generatedAt, new Date(), 15); // e.g. the laptop slept
  const notice = byId('stale');
  notice.hidden = !stale;
  if (stale) notice.textContent = `${i18n.t('staleA', { t: ago })} ${i18n.t('staleB')}`;
  byId('live').classList.toggle('is-stale', stale);
}

/** Animates only when the headline actually changes. */
function setHeadline(/** @type {string} */ state, /** @type {string} */ text) {
  const headline = /** @type {HTMLElement} */ (document.querySelector('.headline'));
  const label = byId('hlText');
  if (label.textContent === text && headline.dataset.state === state) return;
  headline.dataset.state = state;
  byId('hlIcon').replaceChildren(statusIcon(state));
  label.textContent = text;
  replayClass(headline, 'swap');
}
