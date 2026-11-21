// @ts-check
// Where the status data lives.
//
// Live: a SEPARATE data-only repository (CodeMitVishal/is-it-just-me-data) published on the same
// GitHub Pages domain (codemitvishal.github.io), so it is same-origin and the page's
// "connect-src 'self'" still holds. The cloud updater's token can write only to that repo,
// so a leaked token could never change this website's code.
//
// Local development (npm run dev): the collector's test output in web/data and web/feeds.

const LOCAL_HOSTS = ['localhost', '127.0.0.1', '[::1]'];

/** Base path (always same-origin, ends with "/") for data/status.json and feeds/. */
export const DATA_BASE = LOCAL_HOSTS.includes(location.hostname) ? './' : '/is-it-just-me-data/';
