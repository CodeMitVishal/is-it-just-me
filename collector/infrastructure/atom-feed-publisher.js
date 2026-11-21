// @ts-check
// Publisher: one Atom (RSS) feed per service plus feeds/all.xml, built from history.
// Lets people get alerts without us storing anyone's email.
import path from 'node:path';
import { writeText } from './file-system.js';

const WORD = { ok: 'Working fine', minor: 'Having some trouble', down: 'Down', maint: 'Planned maintenance' };
const xml = (/** @type {unknown} */ s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c] ?? c);

/**
 * @typedef {{ t: string, title: string, text: string, link: string }} FeedEntry
 */

/**
 * Pure: renders one Atom document. Exported for tests.
 * @param {{ siteUrl: string, id: string, title: string, entries: FeedEntry[], now: string }} feed
 */
export function renderAtom({ siteUrl, id, title, entries, now }) {
  const self = `${siteUrl}feeds/${id}.xml`;
  const items = entries
    .map((e) => `<entry><title>${xml(e.title)}</title><id>${xml(`${siteUrl}${id}/${e.t}`)}</id><updated>${e.t}</updated><link href="${xml(e.link)}"/><summary>${xml(e.text)}</summary></entry>`)
    .join('\n');
  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
<title>${xml(title)}</title>
<id>${xml(self)}</id>
<link rel="self" href="${xml(self)}"/>
<link href="${xml(siteUrl)}"/>
<updated>${entries[0]?.t ?? now}</updated>
${items}
</feed>
`;
}

/**
 * @param {{ dir: string, siteUrl: string }} options
 * @returns {import('../application/ports.js').Publisher}
 */
export function createAtomFeedPublisher({ dir, siteUrl }) {
  return {
    async publish(snapshot, history) {
      const all = [];
      for (const s of snapshot.services) {
        const entries = (history[s.id]?.events ?? []).map((e) => ({
          t: e.t,
          link: s.page,
          title: `${s.name}: ${WORD[/** @type {keyof WORD} */ (e.state)] ?? e.state}`,
          text: e.text || WORD[/** @type {keyof WORD} */ (e.state)] || '',
        }));
        all.push(...entries);
        await writeText(path.join(dir, `${s.id}.xml`), renderAtom({ siteUrl, id: s.id, title: `${s.name} status`, entries, now: snapshot.generatedAt }));
      }
      all.sort((a, b) => (a.t < b.t ? 1 : -1));
      await writeText(path.join(dir, 'all.xml'), renderAtom({ siteUrl, id: 'all', title: 'All services status', entries: all.slice(0, 100), now: snapshot.generatedAt }));
    },
  };
}
