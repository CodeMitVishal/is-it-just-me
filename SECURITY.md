# Security policy

## Reporting a vulnerability

Please **do not open a public issue** for security problems.
Report them privately via [GitHub Security Advisories](https://github.com/CodeMitVishal/is-it-just-me/security/advisories/new). You can expect a first answer within 7 days.

## Scope

- the website in `web/` (served from GitHub Pages)
- the collector in `collector/` and the GitHub Actions workflow

## How the project is protected

| Risk | Protection |
|---|---|
| Malicious text in a provider's status feed (XSS) | Cleaned in the collector (`clean-text.js`), validated again in the browser (`domain/snapshot.js`), rendered only with `textContent`. A test fails if `innerHTML` is ever used. |
| Third-party scripts, trackers, CDN compromise | None used. A strict Content-Security-Policy allows only same-origin resources (`default-src 'self'`, no inline scripts/styles, `form-action 'none'`, `frame-src 'none'`, `object-src 'none'`). |
| Malicious links | Only `https:` links are kept; external links use `rel="noopener noreferrer"` and the page sends no referrer. |
| Malicious images | Icons are downloaded once by `tools/fetch-icons.js` (https only, size cap, magic-byte check, unsafe SVG rejected), committed and reviewable. Visitors' browsers never fetch third-party images (`img-src 'self'`). |
| "Check live now" (browser reads providers directly) | Only after the visitor presses the button. `connect-src` lists exactly the 35 provider hosts (a test keeps it in sync with the config — no wildcards). Requests send no cookies and no referrer, have a 10 s timeout and a size cap; results are parsed by pure functions and rendered with `textContent`. Disclosed on the privacy page. |
| Hostile or huge responses to the collector | https only (also after redirects), 15 s timeout, 8 MB cap, per-provider isolation — a failure shows "Can't check", never "Working". |
| Supply chain | Zero npm dependencies. GitHub Actions pinned to commit SHAs and kept current by Dependabot. |
| Publishing without Actions | `tools/publish.js` uses your own git login, only fast-forwards `main`, commits only `data/history.json`, and force-pushes a freshly built `gh-pages` branch. |
| Workflow token abuse | Default `contents: read`; the build job may write only `data/history.json`; only the deploy job gets `pages`/`id-token`. No secrets, no `pull_request_target`. |
| Broken changes reaching production | Tests (including architecture and security rules) run before every deploy. |

## Known limitations

GitHub Pages cannot send custom HTTP headers, so the CSP is delivered as a `<meta>` tag. This means `frame-ancestors` (clickjacking protection) and `Permissions-Policy` cannot be set. The site has no logins or sensitive actions, so the impact is low.
