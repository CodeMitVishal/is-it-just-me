# Security policy

## Reporting a vulnerability

Please **do not open a public issue** for security problems.
Report them privately via [GitHub Security Advisories](https://github.com/CodeMitVishal/is-it-just-me/security/advisories/new). You can expect a first answer within 7 days.

## Scope

- the website in `web/` (served from GitHub Pages)
- the collector in `collector/`, the cloud updater in `cloud/apps-script/`, and the GitHub Actions workflow

## How the project is protected

| Risk | Protection |
|---|---|
| Malicious text in a provider's status feed (XSS) | Cleaned in the collector (`clean-text.js`), validated again in the browser (`domain/snapshot.js`), rendered only with `textContent`. A test fails if `innerHTML` is ever used. |
| Third-party scripts, trackers, CDN compromise | None used. A strict Content-Security-Policy allows only same-origin resources (`default-src 'self'`, no inline scripts/styles, `form-action 'none'`, `frame-src 'none'`, `object-src 'none'`). |
| Malicious links | Only `https:` links are kept; external links use `rel="noopener noreferrer"` and the page sends no referrer. |
| Malicious images | Icons are downloaded once by `tools/fetch-icons.js` (https only, size cap, magic-byte check, unsafe SVG rejected), committed and reviewable. Visitors' browsers never fetch third-party images (`img-src 'self'`). |
| Visitors' browsers contacting third parties | Never: `connect-src 'self'`. Browsers read only the cached `status.json` on GitHub Pages; a test fails if web code fetches an absolute URL or bypasses the cache. |
| Hostile or huge responses to the collector | https only (also after redirects), 15 s timeout, 8 MB cap, per-provider isolation — a failure shows "Can't check", never "Working". |
| Supply chain | Zero npm dependencies. GitHub Actions pinned to commit SHAs and kept current by Dependabot. |
| Cloud updater (Google Apps Script) | Writes only to the separate **data-only repo** `is-it-just-me-data`. Its fine-grained token is limited to that repo and "Contents" only, so even a leaked token cannot change the website's code (the worst case is fake status text, which is validated and rendered as plain text). The token is kept in private script properties. Manifest requests just 2 scopes (external requests, triggers). https only with every redirect hop checked, size cap, one commit per run with a bot name and GitHub noreply email. |
| Deploying website code | `npm run deploy` refuses uncommitted `web/` changes and uploads code only. |
| Repository tampering | `main` is protected by a ruleset (no force-push, no deletion). Secret scanning + push protection and Dependabot security updates are on. |
| Workflow token abuse | Default `contents: read`; the build job may write only `data/history.json`; only the deploy job gets `pages`/`id-token`. No secrets, no `pull_request_target`. |
| Broken changes reaching production | Tests (including architecture and security rules) run before every deploy. |

## Known limitations

All repositories of one GitHub user share the same Pages domain (`codemitvishal.github.io`). Content in any of them is same-origin with this site. The site trusts nothing from other paths: data is validated, rendered as text, and settings read from local storage are checked against fixed lists.


GitHub Pages cannot send custom HTTP headers, so the CSP is delivered as a `<meta>` tag. This means `frame-ancestors` (clickjacking protection) and `Permissions-Policy` cannot be set. The site has no logins or sensitive actions, so the impact is low.
