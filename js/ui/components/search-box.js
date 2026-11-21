// @ts-check
// "Which tool isn't working for you?" — input, popular quick picks, and the answer card.
import { byId, el } from '../dom.js';
import { statusIcon } from '../icons.js';
import { answerKeys } from '../messages.js';
import { followButton } from './service-row.js';

const POPULAR = ['teams', 'zoom', 'slack', 'aws', 'azuredevops', 'github', 'atlassian'];
const CHIP_LABEL = { atlassian: 'Jira' }; // people search for the product, not the company

/** Wires the input once. @param {import('../context.js').UiContext} ctx */
export function mountSearchBox(ctx) {
  const input = /** @type {HTMLInputElement} */ (byId('q'));
  const clear = byId('clearQ');
  let timer = 0;

  const apply = (/** @type {string} */ value) => {
    input.value = value;
    clear.hidden = !value;
    ctx.actions.setQuery(value);
  };

  input.addEventListener('input', () => {
    clear.hidden = !input.value;
    clearTimeout(timer);
    timer = window.setTimeout(() => ctx.actions.setQuery(input.value), 80); // light debounce
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && input.value) { e.stopPropagation(); apply(''); }
  });
  clear.addEventListener('click', () => { apply(''); input.focus(); });

  return { setValue: apply };
}

/**
 * @param {import('../../domain/status.js').Service[]} services
 * @param {(value: string) => void} onPick
 */
export function renderQuickPicks(services, onPick) {
  const wrap = byId('quick');
  const label = /** @type {Element} */ (wrap.firstElementChild);
  const chips = POPULAR.map((id) => services.find((s) => s.id === id)).filter((s) => s !== undefined).map((s) => {
    const chip = el('button', 'chip', CHIP_LABEL[/** @type {keyof CHIP_LABEL} */ (s.id)] ?? s.name.replace(/^Microsoft /, ''));
    chip.type = 'button';
    chip.addEventListener('click', () => onPick(/** @type {string} */ (chip.textContent)));
    return chip;
  });
  wrap.replaceChildren(label, ...chips);
}

/**
 * @param {import('../../domain/status.js').Service[] | null} matches   null = no search
 * @param {string} query
 * @param {import('../context.js').UiContext} ctx
 */
export function renderAnswer(matches, query, ctx) {
  const { t } = ctx.i18n;
  const box = byId('answer');
  if (!matches) { box.hidden = true; return; }

  if (!matches.length) {
    box.dataset.state = 'unknown';
    box.replaceChildren(statusIcon('unknown'), el('h2', null, t('ansNone', { q: query.trim().slice(0, 40) })), el('p', null, t('ansNoneText')));
  } else {
    const best = matches[0];
    const [headlineKey, textKey] = answerKeys(best);
    const details = el('button', 'btn btn-primary', t('details'));
    details.type = 'button';
    details.addEventListener('click', () => ctx.actions.openDetails(best));
    const actions = el('div', 'ans-actions');
    actions.append(details, followButton(best, true, ctx));

    box.dataset.state = best.state;
    box.replaceChildren(statusIcon(best.state), el('h2', null, t(headlineKey, { name: best.name })), el('p', null, t(textKey)), actions);
    if (matches.length > 1) box.append(el('p', 'more', t('ansMore', { n: matches.length - 1 })));
  }
  box.hidden = false;
}
