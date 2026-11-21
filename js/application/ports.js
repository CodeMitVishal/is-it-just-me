// @ts-check
// Ports: what the application layer needs. Infrastructure implements them; tests fake them.

/**
 * Small persistent key/value store (implemented with localStorage).
 * @typedef {object} KeyValueStore
 * @property {<T>(key: string, fallback: T) => T} get
 * @property {(key: string, value: unknown) => void} set
 */

/**
 * The list of services, served with the website (implemented with fetch of catalog.json).
 * @typedef {object} CatalogSource
 * @property {() => Promise<unknown>} fetchCatalog
 */

/**
 * Reads one provider's public status feed directly from the visitor's browser.
 * @typedef {object} LiveSource
 * @property {(url: string) => Promise<unknown>} fetchJson
 */

/**
 * Shows system notifications (implemented with the Notification API).
 * @typedef {object} Notifier
 * @property {() => boolean} isEnabled
 * @property {() => boolean} canAsk                        true if the visitor hasn't decided yet
 * @property {() => Promise<boolean>} requestPermission   resolves true when allowed
 * @property {(title: string, body: string, tag: string) => void} show
 */

export {};
