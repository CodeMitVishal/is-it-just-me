// @ts-check
// Domain: Atom (RSS) feeds built from the state-change history. Pure — returns file contents;
// the infrastructure decides where they are written (disk, or a GitHub commit).

const WORD = { ok: 'Working fine', minor: 'Having some trouble', down: 'Down', maint: 'Planned maintenance' };
const xml = (/** @type {unknown} */ s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c] ?? c);

/** @typedef {{ t: string, title: string, text: string, link: string }} FeedEntry */

/**
 * Renders one Atom document.
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
 * All feeds: one per service plus "all".
 * @param {import('./snapshot.js').Snapshot} snapshot
 * @param {import('./history.js').History} history
 * @param {string} siteUrl  ends with "/"
 * @returns {{ path: string, content: string }[]}  paths relative to the site root, e.g. "feeds/zoom.xml"
 */
export function buildFeeds(snapshot, history, siteUrl) {
  const files = [];
  const all = [];
  for (const s of snapshot.services) {
    const entries = (history[s.id]?.events ?? []).map((e) => {
      const word = WORD[/** @type {keyof WORD} */ (e.state)] ?? e.state;
      return { t: e.t, link: s.page, title: `${s.name}: ${word}`, text: e.text || word };
    });
    all.push(...entries);
    files.push({ path: `feeds/${s.id}.xml`, content: renderAtom({ siteUrl, id: s.id, title: `${s.name} status`, entries, now: snapshot.generatedAt }) });
  }
  all.sort((a, b) => (a.t < b.t ? 1 : -1));
  files.push({ path: 'feeds/all.xml', content: renderAtom({ siteUrl, id: 'all', title: 'All services status', entries: all.slice(0, 100), now: snapshot.generatedAt }) });
  return files;
}
