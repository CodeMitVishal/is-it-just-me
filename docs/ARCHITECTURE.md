# Architecture

**A static website with no backend.** GitHub Pages serves the code and the list of services. After the visitor allows it, **each visitor's browser** reads the companies' public status APIs directly. It does this on every visit and every 5 minutes while the tab is visible.

```
 GitHub Pages ──(HTML, CSS, JS, catalog.json)──► visitor's browser
                                                   │  only after "Allow live checks"
                                                   ▼
                                      36 public status APIs (GitHub, Zoom, Slack, Atlassian, …)
```

## Onion layers (`web/js/`)

Arrows point inward: outer layers may use inner ones, never the reverse.

```
        ┌───────────────────────────────────────────────┐
        │  main.js — composition root (wires it all)    │
        │  ┌─────────────────────────────────────────┐  │
        │  │ infrastructure · ui · i18n              │  │   browser APIs, DOM, text
        │  │  ┌───────────────────────────────────┐  │  │
        │  │  │ application — use cases + ports   │  │  │   live check · consent · scheduler · follows
        │  │  │  ┌─────────────────────────────┐  │  │  │
        │  │  │  │ domain — pure rules & types │  │  │  │   no browser APIs, no I/O
        │  │  │  └─────────────────────────────┘  │  │  │
        │  │  └───────────────────────────────────┘  │  │
        │  └─────────────────────────────────────────┘  │
        └───────────────────────────────────────────────┘
```

| Layer | Files | May import |
|---|---|---|
| **Domain** | `status` · `catalog` (validates catalog.json) · `live-parsers` (5 feed formats) · `search` · `summary` · `changes` | only domain |
| **Application** | `live-check` (read every feed once) · `live-consent` (GDPR choice) · `live-updates` (when to run: consent + visible + every 5 min) · `follows` · `change-alerts` · `preferences` · `ports` | domain |
| **Infrastructure** | `catalog-source` · `live-source` (fetch: https only, no cookies, no referrer, timeout, size cap) · `local-store` · `browser-notifier` | application ports |
| **UI / i18n** | `ui/components/*` (hero, consent card, search, rows, groups, dialog, display panel…) · `i18n/` | everything below |
| **Composition root** | `main.js` | everything |

**Ports** (`application/ports.js`): `CatalogSource`, `LiveSource`, `KeyValueStore` and `Notifier`. Tests replace them with in-memory fakes. `tests/architecture.test.js` enforces the layer rules and checks that every import resolves.

## When live checks run

| Situation | Requests to the companies |
|---|---|
| First visit, not decided yet | **None.** The consent card is shown. |
| "Not now" or Display → Live checks → Off | **None.** Status shows as not checked. |
| Allowed, page opened | One check right away (36 requests, one per feed) |
| Allowed, page open and visible | One check every 5 minutes |
| Allowed, tab in the background | **None.** It catches up when the tab becomes visible again. |

## Where do I change…?

| I want to… | Change |
|---|---|
| Add or remove a service | `config/services.json`, then `npm run build:catalog` (and `npm run icons` for its logo). If it brings a new status host, add it to `connect-src` in `web/index.html`; a test tells you. |
| Support a new feed format | Add a parser to `web/js/domain/live-parsers.js` and its kind to `BROWSER_READABLE_KINDS` in `tools/build-catalog.js` (a test checks they match). Only possible if the provider allows browser access (CORS). |
| Change the check interval | `LIVE_INTERVAL_MS` in `web/js/application/live-updates.js` |
| Change how a state is worded | `web/js/i18n/locales/*.js` (all 3 languages) |
| Add a language | Add `web/js/i18n/locales/<code>.js` (same keys as `en.js`), register it in `i18n.js`, add the code to `PREFERENCE_OPTIONS` in `application/preferences.js` **and** `js/boot/preferences-boot.js`, and add a radio button in `index.html`. Tests check that all lists agree. |
| Add a theme | Add a `[data-theme="…"]` block in `web/css/tokens.css`, update the same two option lists, add a radio button |
| Change colours, spacing or fonts | `web/css/tokens.css` |
| Change a piece of the page | The matching file in `web/js/ui/components/` |
| Publish | `npm run deploy` (pushes `web/` to `gh-pages`) |

## Folder map

```
config/services.json          the 43 services (source of truth)
web/
  index.html  privacy.html  catalog.json (generated)  favicon.svg  fonts/  icons/  .well-known/security.txt
  css/                        tokens · base · components · responsive   (loaded in that order)
  js/
    boot/preferences-boot.js  runs before first paint (no flash of the wrong theme)
    domain/                   status · catalog · live-parsers · search · summary · changes
    application/              live-check · live-consent · live-updates · follows · change-alerts · preferences · ports
    infrastructure/           catalog-source · live-source · local-store · browser-notifier
    i18n/                     i18n.js · locales/en.js de.js hi.js
    ui/                       app-view · dom · icons · messages · context · components/*
    main.js
tests/                        node:test — live engine, domain, i18n, architecture, security (+ fixtures/ of real responses)
tools/                        dev-server · deploy-site · build-catalog · fetch-icons
```
