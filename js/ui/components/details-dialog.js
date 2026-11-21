// @ts-check
// The details window for one service (bottom sheet on phones).
import { byId, el } from '../dom.js';
import { icon, statusIcon } from '../icons.js'; // 'external' icon for the official page link
import { STATUS_LABEL, answerKeys } from '../messages.js';
import { followButton } from './service-row.js';
import { serviceLogo } from './service-logo.js';

/** @param {import('../context.js').UiContext} ctx */
export function createDetailsDialog(ctx) {
  const dialog = /** @type {HTMLDialogElement} */ (byId('dlg'));
  const body = byId('dlgBody');
  /** @type {Element | null} */
  let returnFocusTo = null;

  byId('dlgClose').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); }); // backdrop click
  dialog.addEventListener('close', () => {
    if (returnFocusTo instanceof HTMLElement && document.contains(returnFocusTo)) returnFocusTo.focus();
  });

  /** @param {import('../../domain/status.js').Service} service */
  function open(service) {
    returnFocusTo = document.activeElement;
    body.replaceChildren(header(service), statusBox(service), el('p', 'd-p', ctx.i18n.t(answerKeys(service)[1])));
    if (service.details.length) body.append(providerWords(service));
    if (service.state === 'ok') body.append(tip());
    body.append(actions(service));
    if (!dialog.open) dialog.showModal();
  }

  /** @param {import('../../domain/status.js').Service} s */
  function header(s) {
    const box = el('div', 'd-head');
    const titles = el('div');
    const title = el('h2', null, s.name);
    title.id = 'dlgTitle';
    titles.append(title);
    if (s.sub) titles.append(el('p', null, s.sub));
    box.append(serviceLogo(s), titles);
    return box;
  }

  /** @param {import('../../domain/status.js').Service} s */
  function statusBox(s) {
    const { t, clockTime, relativeTime } = ctx.i18n;
    const box = el('div', 'd-status');
    box.dataset.state = s.state;
    box.append(statusIcon(s.state), el('b', null, t(STATUS_LABEL[s.state])));
    if (s.since && s.state !== 'unknown') box.append(el('small', null, `${t('since', { time: clockTime(s.since) })} · ${relativeTime(s.since)}`));
    return box;
  }

  /** The provider's own text stays in English, and says so. @param {import('../../domain/status.js').Service} s */
  function providerWords(s) {
    const { t, lang } = ctx.i18n;
    const box = el('div', 'd-says');
    box.append(el('h3', null, `${t('companySays', { name: s.name })} ${lang === 'en' ? '' : t('englishOnly')}`.trim()));
    const list = el('ul');
    list.lang = 'en';
    s.details.forEach((d) => list.append(el('li', null, d)));
    box.append(list);
    return box;
  }

  function tip() {
    const box = el('div', 'd-tip');
    box.append(el('b', null, ctx.i18n.t('tipTitle')), document.createTextNode(ctx.i18n.t('tipText')));
    return box;
  }

  /** @param {import('../../domain/status.js').Service} s */
  function actions(s) {
    const { t } = ctx.i18n;
    const box = el('div', 'd-actions');
    if (s.page) {
      const link = el('a', 'btn btn-primary');
      link.href = s.page; // already validated as https in the domain
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.append(el('span', null, t('officialPage')), icon('external'));
      box.append(link);
    }
    box.append(followButton(s, true, ctx));
    return box;
  }

  return { open };
}
