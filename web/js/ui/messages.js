// @ts-check
// Maps domain values to translation keys. The only place that knows which words go with which state.
import { CATEGORIES } from '../domain/status.js';

export const STATUS_LABEL = Object.freeze({ ok: 'stOk', minor: 'stMinor', down: 'stDown', maint: 'stMaint', unknown: 'stUnknown' });
export const STATUS_HELP = Object.freeze({ ok: 'lgOk', minor: 'lgMinor', down: 'lgDown', maint: 'lgMaint', unknown: 'lgUnknown' });

export const FILTERS = Object.freeze(['all', ...CATEGORIES]);
export const CATEGORY_LABEL = Object.freeze({
  all: 'catAll', meet: 'catMeet', dev: 'catDev', cloud: 'catCloud', ai: 'catAi', hr: 'catHr', work: 'catWork',
});

/**
 * The plain-language answer to "Is it down?" for a service: [headline key, explanation key].
 * @param {import('../domain/status.js').Service} s
 * @returns {[string, string]}
 */
export function answerKeys(s) {
  switch (s.state) {
    case 'ok': return ['ansOk', 'ansOkText'];
    case 'minor': return ['ansMinor', 'ansMinorText'];
    case 'down': return ['ansDown', 'ansDownText'];
    case 'maint': return ['ansMaint', 'ansMaintText'];
    default: return s.noFeed ? ['ansNoFeed', 'ansNoFeedText'] : ['ansError', 'ansErrorText'];
  }
}

/** First letter for the neutral monogram tile. */
export const monogram = (/** @type {string} */ name) => name.trim().charAt(0).toUpperCase();
