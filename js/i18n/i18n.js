// @ts-check
// Translator. Pure except for Intl (available in browsers and Node), so it is unit-tested.
import en from './locales/en.js';
import de from './locales/de.js';
import hi from './locales/hi.js';

/** @type {Record<string, Record<string, any>>} */
export const LOCALES = { en, de, hi };

/**
 * @param {string} initialLang
 * @param {Record<string, Record<string, any>>} [locales]
 */
export function createI18n(initialLang, locales = LOCALES) {
  let lang = locales[initialLang] ? initialLang : 'en';

  /**
   * Translate a key. Falls back to English, then to the key itself.
   * Plural entries ({ one, other }) are chosen by vars.n.
   * @param {string} key
   * @param {Record<string, string | number>} [vars]
   */
  function t(key, vars = {}) {
    let text = locales[lang]?.[key] ?? locales.en[key] ?? key;
    if (typeof text === 'object') text = text[new Intl.PluralRules(lang).select(Number(vars.n ?? 0))] ?? text.other;
    return String(text).replace(/\{(\w+)\}/g, (match, name) => String(vars[name] ?? match));
  }

  /** "3 minutes ago" / "vor 3 Minuten" / "3 मिनट पहले" */
  function relativeTime(/** @type {string} */ iso, now = new Date()) {
    const seconds = (Date.parse(iso) - now.getTime()) / 1000;
    const abs = Math.abs(seconds);
    if (abs < 60) return t('justNow');
    const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });
    if (abs < 3600) return rtf.format(Math.round(seconds / 60), 'minute');
    if (abs < 86400) return rtf.format(Math.round(seconds / 3600), 'hour');
    return rtf.format(Math.round(seconds / 86400), 'day');
  }

  /** "14:05" today, otherwise "21 Nov, 14:05" (localised). */
  function clockTime(/** @type {string} */ iso, now = new Date()) {
    const date = new Date(iso);
    const today = date.toDateString() === now.toDateString();
    const opts = today ? { hour: '2-digit', minute: '2-digit' } : { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' };
    return new Intl.DateTimeFormat(lang, /** @type {Intl.DateTimeFormatOptions} */ (opts)).format(date);
  }

  return {
    t,
    relativeTime,
    clockTime,
    get lang() { return lang; },
    setLang(/** @type {string} */ next) { if (locales[next]) lang = next; },
  };
}

/** @typedef {ReturnType<typeof createI18n>} I18n */
