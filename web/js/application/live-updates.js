// @ts-check
// Use case: WHEN live checks run. On page load and every 5 minutes, only with consent,
// only while the page is visible, and never two at once. Pure scheduling logic (no timers here —
// main.js calls tick() from a timer and from the page-visibility event).

export const LIVE_INTERVAL_MS = 5 * 60_000;

/**
 * @param {object} deps
 * @param {import('./live-consent.js').LiveConsent} deps.consent
 * @param {() => Promise<void>} deps.run         performs one live check
 * @param {() => boolean} deps.isVisible
 * @param {() => number} [deps.now]
 */
export function createLiveUpdates({ consent, run, isVisible, now = () => Date.now() }) {
  let lastRun = -Infinity;
  let running = false;

  /** Runs a check if allowed and due. `force` ignores the 5-minute spacing (first load, "turn on"). */
  async function tick(force = false) {
    if (!consent.isGranted() || !isVisible() || running) return false;
    if (!force && now() - lastRun < LIVE_INTERVAL_MS) return false;
    running = true;
    lastRun = now();
    try { await run(); } finally { running = false; }
    return true;
  }

  return { tick, isRunning: () => running };
}
