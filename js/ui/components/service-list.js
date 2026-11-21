// @ts-check
// A simple list of rows — used for both "Needs attention" and "Following".
import { serviceRow } from './service-row.js';

/**
 * @param {HTMLElement} container
 * @param {import('../../domain/status.js').Service[]} services
 * @param {{ withNote: boolean, previousStates: Record<string, string> | null }} options
 * @param {import('../context.js').UiContext} ctx
 */
export function renderServiceList(container, services, { withNote, previousStates }, ctx) {
  container.replaceChildren(
    ...services.map((s, index) =>
      serviceRow(s, { index, withNote, changed: wasChanged(s, previousStates) }, ctx))
  );
}

/** @param {import('../../domain/status.js').Service} s @param {Record<string, string> | null} previous */
export const wasChanged = (s, previous) => Boolean(previous?.[s.id] && previous[s.id] !== s.state);
