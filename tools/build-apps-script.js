// Builds cloud/apps-script/Code.gs: ONE file you paste into Google Apps Script.
// It bundles the collector's domain, use case and provider adapters (the same code that runs
// in Node) plus config/services.json, followed by the Apps Script runtime (cloud/apps-script/runtime.js).
//
//   npm run build:gas
//
// Apps Script has no import/export, so each module is wrapped in a function and stored in
// __modules['collector/…'] — no name clashes, no code changes needed in the modules themselves.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'cloud/apps-script/Code.gs');
const ENTRIES = [
  'collector/domain/catalog.js',
  'collector/domain/feeds.js',
  'collector/application/collect-statuses.js',
  'collector/adapters/providers/index.js',
];

const rel = (abs) => path.relative(ROOT, abs).replaceAll('\\', '/');
const IMPORT = /^import\s+(?:\{([^}]*)\}|(\w+))\s+from\s+['"](\.[^'"]+)['"];?\s*$/gm;

/** Converts one ES module into a function body returning its exports. */
function transform(file) {
  let src = readFileSync(path.join(ROOT, file), 'utf8');
  const deps = [];
  src = src.replace(IMPORT, (_, named, def, spec) => {
    const target = rel(path.resolve(path.dirname(path.join(ROOT, file)), spec));
    deps.push(target);
    return named ? `const {${named}} = __modules['${target}'];` : `const ${def} = __modules['${target}'].default;`;
  });
  if (/^\s*import\s/m.test(src)) throw new Error(`${file}: unsupported import form`);
  const exported = [];
  src = src
    .replace(/^export \{\};?\s*$/gm, '')
    .replace(/^export (async function|function|const|let|class) (\w+)/gm, (_, kind, name) => { exported.push(name); return `${kind} ${name}`; })
    .replace(/^export default /m, () => { exported.push('default: __default'); return 'const __default = '; });
  if (/^\s*export\s/m.test(src)) throw new Error(`${file}: unsupported export form`);
  return { deps, body: `${src.replace(/^\/\/ @ts-check\n/, '')}\nreturn { ${exported.join(', ')} };` };
}

export function buildBundle() {
  const done = new Map();
  const visit = (file) => {
    if (done.has(file)) return;
    const mod = transform(file);
    mod.deps.forEach(visit); // dependencies first
    done.set(file, mod);
  };
  ENTRIES.forEach(visit);

  const catalog = JSON.parse(readFileSync(path.join(ROOT, 'config/services.json'), 'utf8'));
  const modules = [...done].map(([file, { body }]) =>
    `// ----- ${file} -----\n__modules['${file}'] = (function () {\n${body}\n})();`).join('\n\n');

  return `// GENERATED FILE — do not edit. Built by tools/build-apps-script.js from collector/ and config/.
// Paste this whole file into Google Apps Script as Code.gs. See README → "Cloud updater".
/* eslint-disable */

const CATALOG = ${JSON.stringify(catalog)};

const __modules = {};

${modules}

${readFileSync(path.join(ROOT, 'cloud/apps-script/runtime.js'), 'utf8')}`;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  writeFileSync(OUT, buildBundle());
  console.log(`wrote ${rel(OUT)}`);
}
