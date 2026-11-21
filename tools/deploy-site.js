// Deploys the WEBSITE CODE (web/) to this repo's gh-pages branch. Code only: status data lives
// in the separate data repo (is-it-just-me-data), written by the cloud updater.
// GitHub Pages' built-in build then publishes the branch (no GitHub Actions needed).
//
//   npm run deploy              deploy web/
//   npm run deploy -- --dry-run build the branch in a temp folder, don't push
//
// gh-pages is replaced by a single new commit each time, so the repository never grows.
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DRY_RUN = process.argv.includes('--dry-run');
const BRANCH = 'gh-pages';
const LOCAL_ONLY = new Set(['data', 'feeds']); // local test output from `npm run collect` — never deployed

const git = (args, cwd = ROOT) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const log = (msg) => console.log(`[deploy] ${msg}`);

function main() {
  if (git(['status', '--porcelain', '--', 'web'])) throw new Error('web/ has uncommitted changes — commit them first so the live site matches main');
  const origin = git(['remote', 'get-url', 'origin']);
  const source = git(['rev-parse', '--short', 'HEAD']);
  const dir = mkdtempSync(path.join(tmpdir(), 'iijm-deploy-'));
  try {
    for (const name of readdirSync(path.join(ROOT, 'web'))) {
      if (!LOCAL_ONLY.has(name)) cpSync(path.join(ROOT, 'web', name), path.join(dir, name), { recursive: true });
    }
    writeFileSync(path.join(dir, '.nojekyll'), ''); // serve files as-is (keeps .well-known/)

    git(['init', '--quiet', '-b', BRANCH], dir);
    git(['config', 'core.autocrlf', 'false'], dir);
    for (const key of ['user.name', 'user.email']) git(['config', key, git(['config', key])], dir); // same author as this repo
    git(['add', '-A'], dir);
    git(['commit', '--quiet', '-m', `Deploy site from main@${source}`], dir);
    if (DRY_RUN) { log(`dry run: built in ${dir}`); return; }
    git(['push', '--quiet', '--force', origin, `${BRANCH}:${BRANCH}`], dir);
    log(`deployed main@${source} → ${BRANCH} (code only)`);
  } finally {
    if (!DRY_RUN) rmSync(dir, { recursive: true, force: true });
  }
}

try {
  main();
} catch (err) {
  console.error(`[deploy] failed: ${(err.stderr || err.message || err).toString().trim()}`);
  process.exit(1);
}
