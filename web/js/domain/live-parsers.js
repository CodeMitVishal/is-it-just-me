// @ts-check
// Domain: read a provider's public status feed directly in the browser ("Check live now").
// Pure functions: JSON in → { state, details } out. Untrusted text is cut to a safe length
// and is always rendered with textContent by the UI.
//
// Only formats whose providers allow browser access (CORS) are supported. The collector
// (Node) has its own full set of adapters; the two sides intentionally share no code.

/** @typedef {{ state: import('./status.js').StatusLevel, details: string[] }} LiveReading */

const text = (/** @type {unknown} */ v) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, 180);
const worse = (/** @type {string} */ a, /** @type {string} */ b) => (({ ok: 0, maint: 1, minor: 2, down: 3 })[b] > ({ ok: 0, maint: 1, minor: 2, down: 3 })[a] ? b : a);
const TICKET_ID = /^[A-Z]{2,5}[-\s]?\d{4,}$/;

/** @type {Record<string, (json: any) => LiveReading>} */
export const LIVE_PARSERS = {
  statuspage(json) {
    const map = { none: 'ok', minor: 'minor', major: 'down', critical: 'down', maintenance: 'maint' };
    let state = map[/** @type {keyof map} */ (json?.status?.indicator)];
    if (!state) throw new Error('unexpected indicator');
    const details = (json.incidents ?? []).map((i) => text(i.name)).filter((n) => n && !TICKET_ID.test(n));
    if ((json.scheduled_maintenances ?? []).some((m) => m.status === 'in_progress')) {
      details.push(...json.scheduled_maintenances.filter((m) => m.status === 'in_progress').map((m) => text(m.name)));
      if (state === 'ok') state = 'maint';
    }
    return result(state, details);
  },
  azdo(json) {
    const map = { healthy: 'ok', advisory: 'minor', degraded: 'minor', unhealthy: 'down' };
    const state = map[/** @type {keyof map} */ (String(json?.status?.health ?? '').toLowerCase())];
    if (!state) throw new Error('unexpected health');
    return result(state, state === 'ok' ? [] : [text(json.status.message)]);
  },
  gcpjson(json) {
    if (!Array.isArray(json)) throw new Error('unexpected format');
    const active = json.filter((i) => !i.end);
    const state = active.reduce((s, i) => worse(s, i.status_impact === 'SERVICE_OUTAGE' ? 'down' : 'minor'), 'ok');
    return result(state, active.map((i) => text(i.external_desc)));
  },
  slack(json) {
    if (!Array.isArray(json?.active_incidents)) throw new Error('unexpected format');
    const state = json.active_incidents.reduce((s, i) => worse(s, i.type === 'outage' ? 'down' : 'minor'), 'ok');
    return result(state, json.active_incidents.map((i) => text(i.title)));
  },
  statusio(json) {
    const code = Number(json?.result?.status_overall?.status_code);
    if (!code) throw new Error('unexpected format');
    const state = code === 100 ? 'ok' : code === 200 ? 'maint' : code >= 500 ? 'down' : 'minor';
    return result(state, (json.result.status ?? []).filter((c) => Number(c.status_code) !== 100).map((c) => text(c.name)));
  },
};

export const LIVE_KINDS = Object.freeze(Object.keys(LIVE_PARSERS));

/** @returns {LiveReading} */
function result(/** @type {any} */ state, /** @type {string[]} */ details) {
  return { state, details: state === 'ok' ? [] : details.filter(Boolean).slice(0, 4) };
}
