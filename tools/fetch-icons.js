// Downloads each service's icon from its OWN public status page and saves it to web/icons/.
// Run manually (npm run icons) and review the result in git — icons are not fetched at runtime,
// so visitors' browsers never contact third parties.
//
// Safety: https only, size cap, the file's magic bytes must match a real image format,
// SVGs containing scripts or event handlers are rejected.
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONFIG = path.join(ROOT, 'config/services.json');
const OUT = path.join(ROOT, 'web/icons');
const MAX_BYTES = 300 * 1024;
const UA = 'Mozilla/5.0 (compatible; StatusBoardBot/1.0)';

const MAX_PAGE_BYTES = 4 * 1024 * 1024;
// Statuspage's built-in default icon — not the company's logo.
const GENERIC = /cloudfront\.net\/assets\/base\//;

async function get(url, maxBytes = MAX_BYTES) {
  if (!url.startsWith('https://')) throw new Error('https only');
  const res = await fetch(url, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(15000), redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (!res.url.startsWith('https://')) throw new Error('redirected to non-https');
  const bytes = new Uint8Array(await res.arrayBuffer());
  if (bytes.length > maxBytes) throw new Error('too large');
  return { bytes, url: res.url };
}

/** Icon candidates declared in the page's <link> tags, best first. */
function candidates(html, base) {
  const links = [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]);
  const scored = [];
  for (const tag of links) {
    const rel = (tag.match(/rel=["']([^"']+)["']/i) || [])[1]?.toLowerCase() ?? '';
    const href = (tag.match(/href=["']([^"']+)["']/i) || [])[1];
    if (!href || !/icon/.test(rel)) continue;
    const size = Number(((tag.match(/sizes=["'](\d+)x\d+["']/i) || [])[1]) ?? 0);
    if (GENERIC.test(href)) continue;
    const score = (rel.includes('apple-touch-icon') ? 1000 : 0) + Math.min(size, 512) + (/\.(svg|png)(\?|$)/i.test(href) ? 300 : 0);
    try { scored.push({ url: new URL(href.replace(/&amp;/g, '&'), base).href, score }); } catch { /* bad href */ }
  }
  scored.sort((a, b) => b.score - a.score);
  return [...scored.map((c) => c.url), new URL('/favicon.ico', base).href];
}

/** Returns the file extension for a real image, or null. */
function sniff(bytes) {
  const b = bytes;
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'png';
  if (b[0] === 0x00 && b[1] === 0x00 && b[2] === 0x01 && b[3] === 0x00) return 'ico';
  if (b[0] === 0xff && b[1] === 0xd8) return 'jpg';
  if (String.fromCharCode(...b.slice(0, 4)) === 'RIFF' && String.fromCharCode(...b.slice(8, 12)) === 'WEBP') return 'webp';
  const head = new TextDecoder().decode(b.slice(0, 2000)).trimStart();
  if (/^(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*<svg[\s>]/i.test(head)) {
    const text = new TextDecoder().decode(b);
    if (/<script|\son\w+\s*=|javascript:|<foreignObject/i.test(text)) return null; // unsafe SVG
    return 'svg';
  }
  return null;
}

const services = JSON.parse(await readFile(CONFIG, 'utf8'));
await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const results = await Promise.all(services.map(async (s) => {
  try {
    const page = await get(s.page, MAX_PAGE_BYTES);
    const html = new TextDecoder().decode(page.bytes);
    for (const url of candidates(html, page.url)) {
      try {
        const { bytes } = await get(url);
        const ext = sniff(bytes);
        if (!ext || bytes.length < 100) continue;
        const file = `icons/${s.id}.${ext}`;
        await writeFile(path.join(ROOT, 'web', file), bytes);
        return { id: s.id, icon: file, from: url };
      } catch { /* try next candidate */ }
    }
    return { id: s.id, error: 'no usable icon' };
  } catch (err) {
    return { id: s.id, error: err.message };
  }
}));

for (const s of services) {
  const r = results.find((x) => x.id === s.id);
  if (r.icon) s.icon = r.icon; else delete s.icon;
  console.log(r.icon ? `✓ ${s.id.padEnd(13)} ${r.icon}  ← ${r.from}` : `✗ ${s.id.padEnd(13)} ${r.error} (monogram fallback)`);
}
await writeFile(CONFIG, JSON.stringify(services, null, 2) + '\n');
