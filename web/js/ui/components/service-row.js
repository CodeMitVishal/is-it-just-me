// @ts-check
// One service as a row: [monogram] name / note ...... [status] [>]  [bell]
// The row button and the bell are siblings (never a button inside a button).
import { el } from '../dom.js';
import { icon, statusIcon } from '../icons.js';
import { STATUS_LABEL, STATUS_HELP } from '../messages.js';
import { isProblem } from '../../domain/status.js';
import { serviceLogo } from './service-logo.js';

/**
 * Bell toggle. `labelled` = full button with text (dialog, answer card); otherwise icon-only.
 * @param {import('../../domain/status.js').Service} service
 * @param {boolean} labelled
 * @param {import('../context.js').UiContext} ctx
 */
export function followButton(service, labelled, ctx) {
  const { t } = ctx.i18n;
  const on = ctx.follows.has(service.id);
  const button = el('button', labelled ? 'btn btn-ghost' : 'follow');
  button.type = 'button';
  button.dataset.follow = service.id;
  button.setAttribute('aria-pressed', String(on));
  button.append(icon('bell'));
  if (labelled) {
    button.append(el('span', null, t(on ? 'following' : 'follow')));
  } else {
    button.setAttribute('aria-label', t('followAria', { name: service.name }));
    button.title = t('followAria', { name: service.name });
  }
  button.addEventListener('click', (e) => { e.stopPropagation(); ctx.actions.toggleFollow(service, button); });
  return button;
}

/**
 * Updates every bell for one service in place, so keyboard focus is never lost.
 * @param {string} id @param {boolean} on @param {import('../../i18n/i18n.js').I18n['t']} t
 */
export function syncFollowButtons(id, on, t) {
  document.querySelectorAll(`[data-follow="${CSS.escape(id)}"]`).forEach((b) => {
    b.setAttribute('aria-pressed', String(on));
    const label = b.querySelector('span');
    if (label) label.textContent = t(on ? 'following' : 'follow');
  });
}

/**
 * @param {import('../../domain/status.js').Service} service
 * @param {{ index: number, withNote: boolean, changed: boolean }} options
 * @param {import('../context.js').UiContext} ctx
 */
export function serviceRow(service, { index, withNote, changed }, ctx) {
  const { t } = ctx.i18n;
  const row = el('div', 'row');
  row.dataset.state = service.state;
  row.style.setProperty('--i', String(Math.min(index, 30))); // stagger for the entrance animation
  if (changed) row.classList.add('changed');

  const main = el('button', 'row-main');
  main.type = 'button';
  main.setAttribute('aria-haspopup', 'dialog');
  main.setAttribute('aria-label', t('rowAria', { name: service.name, state: t(STATUS_LABEL[service.state]) }));

  const text = el('span', 'row-text');
  text.append(el('span', 'row-name', service.name));
  if (withNote && isProblem(service)) text.append(el('span', 'row-note', service.details[0] || t(STATUS_HELP[service.state])));
  else if (service.sub) text.append(el('span', 'row-sub', service.sub));

  const status = el('span', 'status');
  status.append(statusIcon(service.state), el('span', null, t(STATUS_LABEL[service.state])));

  main.append(serviceLogo(service), text, status, icon('chevron', 'i chev'));
  main.addEventListener('click', () => ctx.actions.openDetails(service));

  row.append(main, followButton(service, false, ctx));
  return row;
}
