// @ts-check
// "What the signs mean".
import { byId, el } from '../dom.js';
import { statusIcon } from '../icons.js';
import { STATUS_LABEL, STATUS_HELP } from '../messages.js';
import { STATUSES } from '../../domain/status.js';

/** @param {import('../../i18n/i18n.js').I18n['t']} t */
export function renderLegend(t) {
  byId('legend').replaceChildren(...STATUSES.map((state) => {
    const item = el('li');
    const text = el('div');
    text.append(el('b', null, t(STATUS_LABEL[state])), el('span', null, t(STATUS_HELP[state])));
    item.append(statusIcon(state), text);
    return item;
  }));
}
