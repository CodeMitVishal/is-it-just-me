# Security policy

## Reporting a vulnerability

Please **do not open a public issue** for security problems.
Report them privately via [GitHub Security Advisories](https://github.com/CodeMitVishal/is-it-just-me/security/advisories/new). You can expect a first answer within 7 days.

## Scope

The website in `web/` (served from GitHub Pages) and the tools in `tools/`.

## Design: nothing to steal

There is **no backend, no database, no token and no API key**. The website is static. Each visitor's browser reads the companies' public status APIs itself, and only after the visitor allows it. A test scans every file in the repository for secrets.

## How the project is protected

| Risk | Protection |
|---|---|
| Malicious text in a provider's status feed (XSS) | Parsed by pure functions (`domain/live-parsers.js`), cut to a safe length, rendered only with `textContent`. A test fails if `innerHTML` is ever used. Unknown formats throw, so they show "Can't check" and never "working". |
| Third-party scripts, trackers, CDN compromise | None used. The Content-Security-Policy allows code, styles, fonts and images only from this site, with no inline code, `form-action 'none'`, `frame-src 'none'` and `object-src 'none'`. |
| The browser talking to unexpected hosts | `connect-src` lists exactly the 36 status-API hosts from `web/catalog.json`, https only, with no wildcards. A test keeps it in sync. |
| Privacy of the visitor | Live checks run only after consent, which can be withdrawn at any time (Display → Live checks). Requests send no cookies (`credentials: 'omit'`) and no referrer. |
| Malicious links | Only `https:` links are kept. External links use `rel="noopener noreferrer"`, and the page sends no referrer. |
| Malicious images | Icons are downloaded once by `tools/fetch-icons.js` (https only, size cap, magic-byte check, unsafe SVG rejected), committed and reviewable. `img-src 'self'`. |
| Untrusted service list | `web/catalog.json` is validated in the browser (`domain/catalog.js`): ids, https-only URLs, known feed formats and same-site icon paths. |
| Repository tampering | `main` is protected by a ruleset (no force-push, no deletion). Secret scanning, push protection and private vulnerability reporting are on. |
| Supply chain | Zero npm dependencies. Nothing is built or bundled from third-party code. |

## Known limitations

- **No custom headers.** GitHub Pages cannot send custom HTTP headers, so the CSP is delivered as a `<meta>` tag. This means `frame-ancestors` (clickjacking protection) and `Permissions-Policy` cannot be set. The site has no logins or sensitive actions, so the impact is low.
- **Shared domain.** All repositories of one GitHub user share the same Pages domain (`codemitvishal.github.io`), so content in any of them is same-origin with this site. The site trusts nothing from other paths: settings read from local storage are checked against fixed lists.
