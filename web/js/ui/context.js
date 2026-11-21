// @ts-check
// Shared types for UI components (JSDoc only).

/**
 * Everything a component may need, passed in by main.js (no globals).
 * @typedef {object} UiContext
 * @property {import('../i18n/i18n.js').I18n} i18n
 * @property {import('../application/follows.js').Follows} follows
 * @property {UiActions} actions
 */

/**
 * User intentions. Components call these; main.js decides what happens.
 * @typedef {object} UiActions
 * @property {(service: import('../domain/status.js').Service) => void} openDetails
 * @property {(service: import('../domain/status.js').Service, source?: HTMLElement) => void} toggleFollow
 * @property {(query: string) => void} setQuery
 * @property {(filter: string) => void} setFilter
 * @property {(on: boolean) => void} setOnlyProblems
 * @property {(lang: string) => void} setLanguage
 */

/**
 * The whole UI state. Rendering is a function of this.
 * @typedef {object} ViewState
 * @property {import('../domain/snapshot.js').Snapshot | null} snapshot
 * @property {Record<string, string> | null} previousStates   to highlight rows that just changed
 * @property {string} filter
 * @property {string} query
 * @property {boolean} onlyProblems
 */

export {};
