// Deploys the WEBSITE CODE (web/) to the gh-pages branch. It never collects or pushes status
// data: data/ and feeds/ already on gh-pages (written by the cloud updater) are kept as they are.
// GitHub Pages' built-in build then publishes the branch (no GitHub Actions needed).
//
//   npm run deploy              deploy web/ code
//   npm run deploy -- --dry-run build the branch in a temp folder, don't push
//
// gh-pages is replaced by a single new commit each time, so the repository never grows.
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DRY_RUN = process.argv.includes('--dry-run');
const BRANCH = 'gh-pages';
const CLOUD_OWNED = new Set(['data', 'feeds', '.git']); // written by the cloud updater — never overwritten here

const git = (args, cwd = ROOT) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const log = (msg) => console.log(`[deploy] ${msg}`);

function main() {
  if (git(['status', '--porcelain', '--', 'web'])) throw new Error('web/ has uncommitted changes — commit them first so the live site matches main');
  const origin = git(['remote', 'get-url', 'origin']);
  const dir = mkdtempSync(path.join(tmpdir(), 'iijm-deploy-'));
  try {
    // 1. Current gh-pages (to keep the cloud's data), or an empty branch the first time.
    let hasBranch = true;
    try { git(['clone', '--quiet', '--depth', '1', '--branch', BRANCH, origin, dir]); } catch { hasBranch = false; }
    if (!hasBranch) { git(['init', '--quiet', dir]); git(['remote', 'add', 'origin', origin], dir); }
    if (!existsSync(path.join(dir, 'data', 'status.json'))) log('warning: no data/status.json on gh-pages yet — the cloud updater will add it on its next run');

    // 2. Replace everything except the cloud-owned folders with the current web/ code.
    for (const name of readdirSync(dir)) if (!CLOUD_OWNED.has(name)) rmSync(path.join(dir, name), { recursive: true, force: true });
    for (const name of readdirSync(path.join(ROOT, 'web'))) {
      if (name === 'data' || name === 'feeds') continue; // local test data never goes online
      cpSync(path.join(ROOT, 'web', name), path.join(dir, name), { recursive: true });
    }
    writeFileSync(path.join(dir, '.nojekyll'), ''); // serve files as-is (keeps .well-known/)

    // 3. One fresh commit (no history), same author as this repo.
    const source = git(['rev-parse', '--short', 'HEAD']);
    git(['checkout', '--quiet', '--orphan', 'deploy'], dir);
    git(['config', 'core.autocrlf', 'false'], dir);
    for (const key of ['user.name', 'user.email']) git(['config', key, git(['config', key])], dir);
    git(['add', '-A'], dir);
    git(['commit', '--quiet', '-m', `Deploy site from main@${source}`], dir);
    if (DRY_RUN) { log(`dry run: built in ${dir}`); return; }
    git(['push', '--quiet', '--force', 'origin', `deploy:${BRANCH}`], dir);
    log(`deployed main@${source} → ${BRANCH} (status data kept)`);
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
