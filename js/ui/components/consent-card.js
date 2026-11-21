// @ts-check
// The live-check permission card (GDPR). Shown until the visitor decides; afterwards a small
// "turn on" hint if they said no. The choice can be changed any time in the Display panel.
import { byId } from '../dom.js';

/**
 * Wires the buttons once.
 * @param {{ onAllow: () => void, onDeny: () => void }} handlers
 */
export function mountConsentCard({ onAllow, onDeny }) {
  byId('consentAllow').addEventListener('click', onAllow);
  byId('consentDeny').addEventListener('click', onDeny);
}

/**
 * @param {'granted' | 'denied' | null} choice
 * @param {import('../../i18n/i18n.js').I18n['t']} t
 * @param {number} liveCount  how many companies the browser would contact
 */
export function renderConsentCard(choice, t, liveCount) {
  const card = byId('consent');
  card.hidden = choice === 'granted';
  if (choice === 'granted') return;
  const asking = choice === null;
  card.dataset.mode = asking ? 'ask' : 'off';
  byId('consentTitle').textContent = t(asking ? 'consentTitle' : 'consentOffTitle');
  byId('consentText').textContent = t(asking ? 'consentText' : 'consentOffText', { n: liveCount });
  byId('consentAllow').textContent = t(asking ? 'consentAllow' : 'consentTurnOn');
  byId('consentDeny').hidden = !asking;
  byId('consentDeny').textContent = t('consentLater');
}
