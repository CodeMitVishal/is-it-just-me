// @ts-check
// "All tools": category filter buttons + one panel per category.
import { el } from '../dom.js';
import { statusIcon } from '../icons.js';
import { FILTERS, CATEGORY_LABEL } from '../messages.js';
import { CATEGORIES, isProblem, byName } from '../../domain/status.js';
import { disruptedIn } from '../../domain/summary.js';
import { serviceRow } from './service-row.js';
import { wasChanged } from './service-list.js';

/**
 * @param {HTMLElement} container
 * @param {import('../../domain/status.js').Service[]} services
 * @param {string} active
 * @param {import('../context.js').UiContext} ctx
 */
export function renderFilters(container, services, active, ctx) {
  const { t } = ctx.i18n;
  container.replaceChildren(...FILTERS.map((id) => {
    const button = el('button', 'filter');
    button.type = 'button';
    button.setAttribute('aria-pressed', String(id === active));
    button.append(document.createTextNode(t(CATEGORY_LABEL[id])));
    const problems = disruptedIn(services, id);
    if (problems) {
      const badge = el('span', 'cnt');
      badge.append(statusIcon('minor'), document.createTextNode(String(problems)));
      button.append(badge);
    }
    button.addEventListener('click', () => ctx.actions.setFilter(id));
    return button;
  }));
}

/**
 * @param {HTMLElement} container
 * @param {object} view
 * @param {import('../../domain/status.js').Service[]} view.services   all services
 * @param {import('../../domain/status.js').Service[] | null} view.matches   search results, or null
 * @param {string} view.filter
 * @param {boolean} view.onlyProblems
 * @param {Record<string, string> | null} view.previousStates
 * @param {import('../context.js').UiContext} ctx
 */
export function renderGroups(container, { services, matches, filter, onlyProblems, previousStates }, ctx) {
  const { t } = ctx.i18n;
  const categories = filter === 'all' ? CATEGORIES : CATEGORIES.filter((c) => c === filter);
  const panels = [];
  let index = 0;

  for (const cat of categories) {
    const inCategory = services.filter((s) => s.cat === cat);
    let shown = (matches ?? inCategory).filter((s) => s.cat === cat);
    if (onlyProblems) shown = shown.filter(isProblem);
    if (!shown.length) continue;

    const header = el('div', 'group-h');
    const working = inCategory.filter((s) => s.state === 'ok').length;
    header.append(el('h3', null, t(CATEGORY_LABEL[cat])), el('span', null, t('groupCount', { ok: working, n: inCategory.length })));

    const rows = el('div', 'rows');
    rows.append(...[...shown].sort(byName).map((s) =>
      serviceRow(s, { index: index++, withNote: true, changed: wasChanged(s, previousStates) }, ctx)));

    const panel = el('section', 'group');
    panel.append(header, rows);
    panels.push(panel);
  }

  container.replaceChildren(...(panels.length ? panels : [el('p', 'empty', t('noProblemsHere'))]));
}
