# Architecture

The project has two independent programs that meet at one JSON file:

```
           GitHub Action (every ~10 min)                         Visitor's browser
 ┌──────────────────────────────────────────┐          ┌───────────────────────────────────┐
 │ collector/  (Node)                       │          │ web/  (static site, GitHub Pages) │
 │ reads ~40 public status pages            │ writes   │ reads status.json every 60 s,     │
 │ → normalises → history → publishes ──────┼────────► │ shows it, follows, alerts         │
 └──────────────────────────────────────────┘ web/data/status.json  └──────────────────┘
                                             web/feeds/*.xml (RSS)
```

They share **no code**. The contract between them is [`DATA_CONTRACT.md`](DATA_CONTRACT.md), checked by `tests/contract.test.js`.

## Onion layers

Both programs use the same layering. Arrows point inward: outer layers may use inner ones, never the reverse.

```
        ┌───────────────────────────────────────────────┐
        │  main.js — composition root (wires it all)    │
        │  ┌─────────────────────────────────────────┐  │
        │  │ infrastructure / adapters / ui / i18n   │  │   talks to the outside world
        │  │  ┌───────────────────────────────────┐  │  │
        │  │  │ application — use cases + ports   │  │  │   "what the app does"
        │  │  │  ┌─────────────────────────────┐  │  │  │
        │  │  │  │ domain — pure rules & types │  │  │  │   no I/O, no browser, no Node APIs
        │  │  │  └─────────────────────────────┘  │  │  │
        │  │  └───────────────────────────────────┘  │  │
        │  └─────────────────────────────────────────┘  │
        └───────────────────────────────────────────────┘
```

| Layer | Collector | Website | May import |
|---|---|---|---|
| **Domain** | `collector/domain/` status levels, catalog rules, history, snapshot | `web/js/domain/` status, search, summary, change detection, input validation | nothing outside domain |
| **Application** | `collector/application/` `collectStatuses` use case + `ports.js` | `web/js/application/` follows, preferences, change alerts, load status + `ports.js` | domain |
| **Adapters / Infrastructure** | `adapters/providers/` one file per status-page format; `infrastructure/` HTTP, files, RSS | `web/js/infrastructure/` localStorage, fetch, notifications | application (ports), domain |
| **UI / i18n** | — | `web/js/ui/` components; `web/js/i18n/` translator + locales | everything below |
| **Composition root** | `collector/main.js` | `web/js/main.js` | everything |

**Ports** (in each `application/ports.js`) describe what the inner layers need, for example `HttpClient`, `HistoryStore`, `Publisher`, `KeyValueStore`, `StatusSource` and `Notifier`. The outer layers implement them, and the tests replace them with in-memory fakes. This is dependency inversion: the use case never knows it is talking to `fetch` or `localStorage`.

`tests/architecture.test.js` **enforces** these rules. A wrong import, a `node:` built-in in the domain, or `document`/`fetch`/`localStorage` in the web domain fails the build.

## SOLID, concretely

- **Single responsibility:** each file does one job. A provider adapter only parses its format, `hero.js` only draws the headline, and `follows.js` only remembers what you follow.
- **Open/closed:** a new status-page format is a new file in `adapters/providers/` plus one line in its `index.js`. No existing adapter changes.
- **Liskov:** every adapter returns the same `Reading` (through `createReading`), so the use case treats them all the same.
- **Interface segregation:** ports are tiny, from 1 to 3 methods each.
- **Dependency inversion:** use cases receive their dependencies as arguments, and only `main.js` creates concrete ones.

## Where do I change…?

| I want to… | Change |
|---|---|
| Add or remove a service | `config/services.json` (validated on every run), then `npm run icons` for its logo |
| Support a new status-page format | Add `collector/adapters/providers/<name>.js` exporting `{ kind, read }`, register it in `providers/index.js`, add a test with a saved response in `tests/fixtures/` |
| Change how a state is worded | `web/js/i18n/locales/*.js` (all 3 languages) |
| Add a language | Add `web/js/i18n/locales/<code>.js` (same keys as `en.js`), register it in `i18n.js`, add the code to `PREFERENCE_OPTIONS` in `application/preferences.js` **and** `js/boot/preferences-boot.js`, and add a radio button in `index.html`. The tests check that all three lists agree. |
| Add a theme | Add a `[data-theme="…"]` block in `web/css/tokens.css`, update the same two option lists, add a radio button |
| Change colours, spacing or fonts | `web/css/tokens.css` (all other CSS uses its variables) |
| Change a piece of the page | The matching file in `web/js/ui/components/` |
| Change what "Check live now" can read | `web/js/domain/live-parsers.js` + `BROWSER_READABLE_KINDS` in `collector/domain/snapshot.js` + `connect-src` in `web/index.html` (tests check all three agree) |
| Publish without GitHub Actions | `npm run publish`, schedule with `tools/schedule-windows.ps1` |
| Change when data counts as stale | `isStale` in `web/js/domain/summary.js` |

## Folder map

```
config/services.json          the services we watch
collector/
  domain/                     status.js · catalog.js · history.js · snapshot.js
  application/                collect-statuses.js · ports.js
  adapters/providers/         statuspage · azure-devops · google-incidents · aws-health · azure-rss · slack · statusio · stripe · no-feed
  infrastructure/             http-client · file-system · status-json-publisher · atom-feed-publisher
  main.js
web/
  index.html  privacy.html  favicon.svg  fonts/  icons/ (official logos)  .well-known/security.txt
  css/                        tokens · base · components · responsive   (loaded in that order)
  js/
    boot/preferences-boot.js  runs before first paint (no flash of the wrong theme)
    domain/                   status · snapshot · search · summary · changes
    application/              follows · preferences · change-alerts · load-status · ports
    infrastructure/           local-store · status-source · browser-notifier
    i18n/                     i18n.js · locales/en.js de.js hi.js
    ui/                       app-view · dom · icons · messages · context · components/*
    main.js
data/history.json             state-change history (committed by the Action only when something changes)
tests/                        node:test — collector, web, contract, architecture, security (+ fixtures/)
tools/dev-server.js           local preview server
tools/fetch-icons.js          downloads each service's icon from its own status page (run manually, review in git)
```
