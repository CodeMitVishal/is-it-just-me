// @ts-check
// HttpClient implementation on top of Node's fetch, with safety limits.

/**
 * Decodes response bytes. Handles UTF-8 and UTF-16 with a byte-order mark
 * (AWS serves big-endian UTF-16, which Node's TextDecoder can't read directly).
 * @param {Uint8Array} bytes
 * @returns {string}
 */
export function decodeBytes(bytes) {
  const stripBom = (/** @type {string} */ s) => s.replace(/^﻿/, '');
  if (bytes[0] === 0xff && bytes[1] === 0xfe) return stripBom(new TextDecoder('utf-16le').decode(bytes));
  if (bytes[0] === 0xfe && bytes[1] === 0xff) {
    const swapped = new Uint8Array(bytes.length - (bytes.length % 2));
    for (let i = 0; i < swapped.length; i += 2) { swapped[i] = bytes[i + 1]; swapped[i + 1] = bytes[i]; }
    return stripBom(new TextDecoder('utf-16le').decode(swapped));
  }
  return stripBom(new TextDecoder('utf-8').decode(bytes));
}

/**
 * @param {{ timeoutMs?: number, maxBytes?: number, userAgent?: string, fetchImpl?: typeof fetch }} [options]
 * @returns {import('../application/ports.js').HttpClient}
 */
export function createHttpClient({ timeoutMs = 15_000, maxBytes = 8 * 1024 * 1024, userAgent = 'Mozilla/5.0 (compatible; StatusBoardBot/1.0)', fetchImpl = fetch } = {}) {
  async function text(/** @type {string} */ url) {
    if (!url.startsWith('https://')) throw new Error('https only');
    const res = await fetchImpl(url, {
      headers: { 'user-agent': userAgent, accept: 'application/json, application/rss+xml, */*' },
      signal: AbortSignal.timeout(timeoutMs),
      redirect: 'follow',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (res.url && !res.url.startsWith('https://')) throw new Error('redirected to non-https');
    const bytes = new Uint8Array(await res.arrayBuffer());
    if (bytes.length > maxBytes) throw new Error('response too large');
    return decodeBytes(bytes);
  }
  return {
    text,
    json: async (url) => JSON.parse(await text(url)),
  };
}
