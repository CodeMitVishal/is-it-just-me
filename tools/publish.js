// Publish without GitHub Actions: collect fresh statuses on THIS computer and push the
// built site to the `gh-pages` branch. GitHub Pages then deploys it with its own built-in
// build, which keeps working even when Actions can't run (e.g. a billing lock).
//
//   npm run publish                 collect + publish once
//   npm run publish -- --dry-run    collect, build the branch locally, don't push
//
// Schedule it every 15 minutes with tools/schedule-windows.ps1 (Windows) or cron (macOS/Linux).
// Uses your normal git login. No dependencies.
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DRY_RUN = process.argv.includes('--dry-run');
const BRANCH = 'gh-pages';

const git = (args, cwd = ROOT) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const log = (msg) => console.log(`[${new Date().toISOString()}] ${msg}`);

function remoteUrl() {
  const url = git(['remote', 'get-url', 'origin']);
  if (!/^https:\/\/github\.com\/|^git@github\.com:/.test(url)) throw new Error(`unexpected origin remote: ${url}`);
  return url;
}

function main() {
  const origin = remoteUrl();

  // 1. Latest config and history from main (fast-forward only — never overwrites local work).
  if (!DRY_RUN) {
    try { git(['pull', '--ff-only', '--quiet', 'origin', 'main']); } catch (e) { log(`pull skipped: ${e.stderr || e.message}`.trim()); }
  }

  // 2. Collect fresh statuses (writes web/data, web/feeds and data/history.json).
  log('collecting statuses...');
  execFileSync(process.execPath, [path.join(ROOT, 'collector/main.js')], {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env, SITE_URL: siteUrl(origin) },
  });

  // 3. Save history on main only when a status actually changed.
  if (!DRY_RUN && git(['status', '--porcelain', '--', 'data/history.json'])) {
    git(['add', 'data/history.json']);
    git(['commit', '--quiet', '-m', 'chore: status changed']);
    git(['push', '--quiet', 'origin', 'HEAD:main']);
    log('history saved');
  }

  // 4. Build a one-commit gh-pages branch from web/ and force-push it.
  const dir = mkdtempSync(path.join(tmpdir(), 'iijm-pages-'));
  try {
    cpSync(path.join(ROOT, 'web'), dir, { recursive: true });
    writeFileSync(path.join(dir, '.nojekyll'), ''); // serve files as-is (keeps .well-known/)
    git(['init', '--quiet', '-b', BRANCH], dir);
    git(['config', 'core.autocrlf', 'false'], dir);
    for (const key of ['user.name', 'user.email']) {
      const value = git(['config', key]);
      if (value) git(['config', key, value], dir); // same author as the main repo
    }
    git(['add', '-A'], dir);
    git(['commit', '--quiet', '-m', `Publish ${new Date().toISOString()}`], dir);
    if (DRY_RUN) {
      log(`dry run: site built in ${dir} (not pushed)`);
      return;
    }
    git(['push', '--quiet', '--force', origin, `${BRANCH}:${BRANCH}`], dir);
    log(`published to ${BRANCH} -> ${siteUrl(origin)}`);
  } finally {
    if (!DRY_RUN) rmSync(dir, { recursive: true, force: true });
  }
}

/** https://github.com/owner/repo(.git) → https://owner.github.io/repo/ */
function siteUrl(origin) {
  const m = origin.match(/github\.com[/:]([^/]+)\/([^/.]+)/);
  return m ? `https://${m[1].toLowerCase()}.github.io/${m[2]}/` : 'https://example.github.io/is-it-just-me/';
}

try {
  main();
} catch (err) {
  console.error(`publish failed: ${(err.stderr || err.message || err).toString().trim()}`);
  process.exit(1);
}
