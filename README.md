<div align="center">

# Is It Just Me?

**One calm page that tells you, in plain words, whether the tools you work with are up or down: Teams, Zoom, Slack, AWS, Azure, GCP, Azure DevOps, GitHub, Jira, Workday and 30+ more.**

[**Open the live site →**](https://codemitvishal.github.io/is-it-just-me/)

![No backend](https://img.shields.io/badge/backend-none-3fb950)
![No trackers](https://img.shields.io/badge/trackers-none-3fb950)
![Dependencies](https://img.shields.io/badge/npm%20dependencies-0-3fb950)
![License](https://img.shields.io/badge/license-MIT-blue)

</div>

---

## The story

The Friday before last I was invited to a meeting, and nobody showed up.

I'm the kind of person who waits. I gave it 30 minutes and used the time to get other work done. Afterwards I kept wondering: *was everyone else stuck too, was the meeting tool down, or was it just me?*

Answering that took far too long. Every company has its own status page, each one looks different, and most are written for engineers. Microsoft doesn't even publish a public live status for Teams. Developers, managers and HR people all rely on a dozen of these tools every day, but nobody puts them on one screen in words everyone understands.

**So I built that screen.** You open one page and get one sentence: "Yes, Zoom is down. It's not you." There are no accounts, no ads, no tracking, and it costs nothing to run.

## The goal

| | |
|---|---|
| **Answer first** | Type a tool and get a sentence back, such as "No, GitHub is working" or "Yes, Snowflake is down", plus what to do next |
| **Everyone understands it** | Plain words, a different shape *and* colour for each status, and a high-contrast theme and easy-to-read font |
| **One screen for every team** | Meetings and chat, developer tools, cloud, AI, HR and hiring, and everyday work tools |
| **Always live** | Your own browser checks the companies' status pages on every visit and every 5 minutes |
| **Follow what you use** | Tap 🔔 to get a browser notification when a tool changes, while the page is open |
| **Private by design** | Nothing is sent anywhere until you allow live checks. No cookies, no analytics, no tracking |
| **Free forever** | A static website on GitHub Pages: no server, no database, no tokens, no cost |

## What it looks like

- **The answer on top:** for example "4 tools have problems right now", with a search box: *"Which tool isn't working for you?"*
- **"Meeting didn't start?"** One tap checks every meeting tool. That button exists because of the story above.
- **Official logos** taken from each company's own status page, so you recognise tools instantly.
- **Display options:** three themes (Light · Dark · High contrast), three fonts (Modern · Easy to read · Friendly), three languages (English · Deutsch · हिन्दी), and a switch to turn live checks on or off.
- **Phone first:** two-line cards, swipeable filters and a bottom-sheet for details. It works down to 320px wide screens.

## How it works

<p align="center">
  <img src="docs/assets/architecture.svg" alt="Animated diagram: GitHub Pages serves the website code and the list of services. After the visitor allows live checks, their own browser asks 37 companies' public status pages directly, on every visit and every 5 minutes, and shows the result." width="100%">
</p>

```
                         GitHub Pages (static: website code + catalog.json)
                                   │  page load
                                   ▼
          ┌──────────── each visitor's browser (runs the script) ─────────────┐
          │  1. asks once: "Allow live checks?"                               │
          │  2. on every visit + every 5 min (tab visible):                   │
          │     reads 37 public status APIs directly ──► GitHub, Zoom, Slack…  │
          │  3. shows one plain answer                                        │
          └────────────────────────────────────────────────────────────────────┘
```

1. **GitHub Pages serves a static site:** HTML, CSS, JavaScript and `catalog.json`, the list of 43 services. There is no server code and no database.
2. **The visitor decides.** On the first visit the page asks *"Check the status live?"*. Until the visitor says yes, the browser contacts nobody except GitHub Pages.
3. **The visitor's browser does the work.** On every visit, and every 5 minutes while the tab is visible, it reads the public status APIs of 37 companies directly. It turns 5 different feed formats into one simple status: working · some problems · down · maintenance · can't check.
4. **Some can't be checked from a browser.** AWS and Azure block access from other websites, and Teams, Microsoft 365, Webex and Workday publish no public live feed. The site honestly shows "Can't check" for these, with a link to the official page.

### Code architecture (onion layers)

```
   ┌───────────────────────────── web/js/main.js (wires everything) ─────────────────────────────┐
   │  ┌─────────────── infrastructure · ui · i18n (browser APIs, DOM, text) ──────────────────┐  │
   │  │  ┌──────────── application: live check · consent · scheduler · follows ───────────┐  │  │
   │  │  │  ┌──────────── domain: status · catalog · feed parsers · search · summary ──┐   │  │  │
   │  │  │  └───────────────────────────────────────────────────────────────────────────┘   │  │  │
   │  │  └──────────────────────────────────────────────────────────────────────────────────┘  │  │
   │  └──────────────────────────────────────────────────────────────────────────────────────────┘  │
   └──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

An architecture test fails the build if an inner layer imports an outer one, or if the domain or application layers touch browser APIs. See **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** for the full map and a "where do I change X?" table.

## Quick start

Requires Node 20 or later. There's nothing to install.

```bash
npm test               # 38 tests: parsers (on saved real responses), live check, consent, i18n, architecture, security
npm run dev            # preview at http://127.0.0.1:8080
npm run build:catalog  # after editing config/services.json → web/catalog.json (a test fails if you forget)
npm run icons          # refresh official icons from each status page (review the diff)
npm run deploy         # publish web/ to the gh-pages branch (GitHub Pages)
```

## Project structure

```
config/services.json   the 43 services (add or remove one here, then npm run build:catalog)
web/                   the whole website: index.html · privacy.html · catalog.json · css/ · js/ · icons/ · fonts/
tests/                 node:test + saved real provider responses (fixtures/)
docs/                  ARCHITECTURE.md · assets/architecture.svg
tools/                 dev-server.js · deploy-site.js · build-catalog.js · fetch-icons.js
```

## Security, privacy and EU law

I built it to be safe and lawful by default. Full details are in [SECURITY.md](SECURITY.md) and on the site's [Privacy & legal page](https://codemitvishal.github.io/is-it-just-me/privacy.html).

| Topic | How it's handled |
|---|---|
| **GDPR: live checks** | When your browser asks a company's status API, that company sees your IP address. So live checks run **only after you allow them** (Art. 6(1)(a) GDPR, § 25(1) TDDDG). You can switch them off any time in **Display → Live checks**, and from then on nothing is sent. This is explained in English and German. |
| **GDPR: hosting** | GitHub Pages logs IP addresses to deliver the site (Art. 6(1)(f), EU–US Data Privacy Framework). Your rights (Art. 15–21) and complaints (Art. 77) are covered on the privacy page. |
| **Cookies / local storage** | No cookies. Local storage keeps only your own choices (theme, font, language, followed services, live-check choice). Every key is listed on the privacy page, and a test keeps that list complete. |
| **No secrets** | No backend, no tokens, no API keys, so there's nothing to leak. A test scans every file for secrets. |
| **Web security** | A strict Content-Security-Policy: code, styles, fonts and images come only from this site, there's no inline code, and the browser may connect only to an **exact allow-list** of the 36 status-API hosts (a test keeps it in sync). Live requests send no cookies and no referrer. All provider text is validated and rendered with `textContent`. |
| **Trademarks** | Logos only identify each service and come from that company's public status page. No affiliation is implied, and rights holders can request removal. |
| **Accessibility (EAA / WCAG 2.2 AA)** | Full keyboard support, screen-reader labels, status shown by shape and text, a high-contrast theme, an easy-to-read font for low vision (Atkinson Hyperlegible) and reduced motion. |
| **Repository** | `main` is protected against force-push and deletion. Private vulnerability reporting, secret scanning and push protection are on. Zero npm dependencies. |

> Not legal advice. This is a private, non-commercial project. If you run a commercial copy in Germany, you may also need an Impressum (§ 5 DDG).

## Deploy your own copy

1. Fork the repository, keeping it public.
2. Run `npm run deploy`. It pushes `web/` to the `gh-pages` branch.
3. Go to **Settings → Pages**, and choose **Deploy from a branch → gh-pages / (root)**.

Nothing else is needed: no Actions, no server, no tokens.

## Known limits

- **AWS and Azure** block browsers from reading their status, and **Teams, Microsoft 365, Webex and Workday** publish no public live feed. These show "Can't check" with a link to the official page.
- **Alerts** only work while the page is open, because there is no server to send them when it's closed.
- **Each visitor's browser makes its own requests** (37 every 5 minutes while the tab is visible). This is the cost of having no backend.

## Credits and license

Code: [MIT](LICENSE). Fonts: Inter, Atkinson Hyperlegible Next, Nunito and Noto Sans Devanagari ([SIL OFL](web/fonts/OFL.txt)). Logos are trademarks of their owners, and the project isn't affiliated with any company shown.
