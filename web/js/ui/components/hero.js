// @ts-check
// Top of the page: one-sentence answer, the numbers behind it, and how fresh the data is.
import { byId, replayClass } from '../dom.js';
import { statusIcon } from '../icons.js';
import { summarize, isStale } from '../../domain/summary.js';

/**
 * @param {import('../../domain/snapshot.js').Snapshot} snapshot
 * @param {import('../../i18n/i18n.js').I18n} i18n
 */
export function renderHero(snapshot, i18n) {
  const { t } = i18n;
  const sum = summarize(snapshot.services);
  const text = sum.disrupted ? t('hlProblems', { n: sum.disrupted }) : t('hlAllGood');
  setHeadline(sum.overall, text);

  byId('overline').textContent = t('overline', { n: sum.total });
  if (sum.disrupted || sum.maint) {
    const parts = [];
    if (sum.down) parts.push(t('partDown', { n: sum.down }));
    if (sum.minor) parts.push(t('partMinor', { n: sum.minor }));
    if (sum.maint) parts.push(t('partMaint', { n: sum.maint }));
    byId('lede').textContent = `${parts.join(' · ')}. ${t('ledeRest')}`;
  } else {
    byId('lede').textContent = t('ledeAllGood', { n: sum.checkable });
  }
  renderFreshness(snapshot, i18n);
}

/** "Updated 3 minutes ago" + the stale-data warning. Re-run every 30 s. */
export function renderFreshness(/** @type {import('../../domain/snapshot.js').Snapshot} */ snapshot, /** @type {import('../../i18n/i18n.js').I18n} */ i18n) {
  const ago = i18n.relativeTime(snapshot.generatedAt);
  // After "Check live now", the freshest time is the visitor's own live check.
  byId('updated').textContent = snapshot.liveCheckedAt
    ? i18n.t('updatedLive', { t: i18n.relativeTime(snapshot.liveCheckedAt) })
    : i18n.t('updated', { t: ago });
  const stale = isStale(snapshot.liveCheckedAt ?? snapshot.generatedAt, new Date());
  const notice = byId('stale');
  notice.hidden = !stale;
  if (stale) notice.textContent = `${i18n.t('staleA', { t: ago })} ${i18n.t('staleB')}`;
  byId('live').classList.toggle('is-stale', stale);
}

/** @param {import('../../i18n/i18n.js').I18n} i18n */
export function renderLoadError(i18n) {
  setHeadline('unknown', i18n.t('loadError'));
  byId('lede').textContent = i18n.t('loadErrorText');
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
