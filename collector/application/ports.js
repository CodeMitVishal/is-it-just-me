// @ts-check
// Ports: what the application needs from the outside world.
// Infrastructure provides implementations; tests provide fakes. (JSDoc only — no runtime code.)

/**
 * Reads remote resources. Implemented by infrastructure/http-client.js.
 * @typedef {object} HttpClient
 * @property {(url: string) => Promise<string>} text
 * @property {(url: string) => Promise<any>} json
 */

/**
 * Turns one provider's public data into a Reading. One adapter per provider format.
 * @typedef {object} ProviderAdapter
 * @property {string} kind
 * @property {(service: import('../domain/catalog.js').ServiceDefinition, http: HttpClient) => Promise<import('../domain/status.js').Reading>} read
 */

/**
 * Loads and saves the state-change history.
 * @typedef {object} HistoryStore
 * @property {() => Promise<import('../domain/history.js').History>} load
 * @property {(history: import('../domain/history.js').History) => Promise<void>} save
 */

/**
 * Publishes results for the website (status.json, RSS feeds, ...).
 * @typedef {object} Publisher
 * @property {(snapshot: import('../domain/snapshot.js').Snapshot, history: import('../domain/history.js').History) => Promise<void>} publish
 */

/**
 * @typedef {object} Logger
 * @property {(msg: string) => void} info
 * @property {(msg: string) => void} warn
 */

export {};
