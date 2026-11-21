// @ts-check
// Puts the components together. render(state) draws the whole page from the view state.
import { byId } from './dom.js';
import { isProblem, bySeverity } from '../domain/status.js';
import { searchServices } from '../domain/search.js';
import { renderHero, renderFreshness, renderLoadError } from './components/hero.js';
import { renderAnswer } from './components/search-box.js';
import { renderServiceList } from './components/service-list.js';
import { renderFilters, renderGroups } from './components/service-groups.js';
import { renderLegend } from './components/legend.js';

/**
 * @param {import('./context.js').UiContext} ctx
 * @param {{ notificationsEnabled: () => boolean }} options
 */
export function createAppView(ctx, { notificationsEnabled }) {
  let firstPaint = true;

  /** @param {import('./context.js').ViewState} state */
  function render(state) {
    const { snapshot } = state;
    if (!snapshot) return;
    const { services } = snapshot;
    const matches = searchServices(services, state.query);
    const searching = matches !== null;

    renderHero(snapshot, ctx.i18n);
    renderAnswer(matches, state.query, ctx);

    const problems = services.filter(isProblem).sort(bySeverity);
    byId('attnSec').hidden = searching || !problems.length;
    renderServiceList(byId('attnList'), problems, { withNote: true, previousStates: state.previousStates }, ctx);

    renderFollowing(state, searching);
    byId('meetHint').hidden = searching;

    renderFilters(byId('filters'), services, state.filter, ctx);
    const groups = byId('groups');
    renderGroups(groups, { services, matches, filter: state.filter, onlyProblems: state.onlyProblems, previousStates: state.previousStates }, ctx);
    if (firstPaint) {
      groups.classList.add('enter'); // staggered fade-in, first load only
      setTimeout(() => groups.classList.remove('enter'), 1200);
      firstPaint = false;
    }
    renderLegend(ctx.i18n.t);
  }

  /** Re-draws only the "Following" section (used after a follow toggle, so focus isn't lost elsewhere). */
  function renderFollowing(/** @type {import('./context.js').ViewState} */ state, searching = state.query.trim() !== '') {
    if (!state.snapshot) return;
    const mine = state.snapshot.services.filter((s) => ctx.follows.has(s.id)).sort(bySeverity);
    byId('followSec').hidden = searching || !mine.length;
    renderServiceList(byId('followList'), mine, { withNote: false, previousStates: state.previousStates }, ctx);
    byId('notifHint').textContent = mine.length && !notificationsEnabled() ? ctx.i18n.t('notifHint') : '';
  }

  return {
    render,
    renderFollowing,
    renderFreshness: (/** @type {import('./context.js').ViewState} */ state) => state.snapshot && renderFreshness(state.snapshot, ctx.i18n),
    renderLoadError: () => renderLoadError(ctx.i18n),
  };
}
