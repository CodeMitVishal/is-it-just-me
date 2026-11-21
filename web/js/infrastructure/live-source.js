// @ts-check
// LiveSource: the browser reads a provider's public status feed directly.
// No cookies are sent, no referrer, https only, short timeout, size cap.

const TIMEOUT_MS = 10_000;
const MAX_CHARS = 5_000_000;

/** @returns {import('../application/ports.js').LiveSource} */
export function createLiveSource() {
  return {
    async fetchJson(url) {
      if (!String(url).startsWith('https://')) throw new Error('https only');
      const res = await fetch(url, {
        mode: 'cors',
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        cache: 'no-store',
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.text();
      if (body.length > MAX_CHARS) throw new Error('response too large');
      return JSON.parse(body);
    },
  };
}
