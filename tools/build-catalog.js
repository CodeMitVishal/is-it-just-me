// Builds web/catalog.json from config/services.json: the list of services the website shows and,
// for each one, the public feed a visitor's browser may read directly ("live check").
//
//   npm run build:catalog      (run after editing config/services.json; a test fails if you forget)
//
// Only feed formats whose providers allow browser access (CORS) get a `live` entry. AWS, Azure and
// Stripe block browsers, so they are marked `browserBlocked`; services without any public feed keep `noFeed`.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'web/catalog.json');

/** Must equal LIVE_KINDS in web/js/domain/live-parsers.js (checked by a test). */
export const BROWSER_READABLE_KINDS = Object.freeze(['statuspage', 'azdo', 'gcpjson', 'slack', 'statusio']);

export function buildCatalog() {
  const services = JSON.parse(readFileSync(path.join(ROOT, 'config/services.json'), 'utf8'));
  return {
    services: services.map((s) => ({
      id: s.id,
      name: s.name,
      ...(s.sub ? { sub: s.sub } : {}),
      ...(s.aka ? { aka: s.aka } : {}),
      cat: s.cat,
      page: s.page,
      ...(s.icon ? { icon: s.icon } : {}),
      ...(s.kind === 'none'
        ? { noFeed: true }
        : BROWSER_READABLE_KINDS.includes(s.kind)
          ? { live: { kind: s.kind, url: s.url } }
          : { browserBlocked: true }),
    })),
  };
}

export const catalogJson = () => JSON.stringify(buildCatalog(), null, 1) + '\n';

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  writeFileSync(OUT, catalogJson());
  const c = buildCatalog().services;
  console.log(`wrote web/catalog.json: ${c.length} services, ${c.filter((s) => s.live).length} checked live in the browser`);
}
