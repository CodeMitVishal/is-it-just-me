<div align="center">

# Is It Just Me?

**One calm page that tells you, in plain words, whether the tools you work with are up or down: Teams, Zoom, Slack, AWS, Azure, GCP, Azure DevOps, GitHub, Jira, Workday and 30+ more.**

[**Open the live site →**](https://codemitvishal.github.io/is-it-just-me/)

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
| **Follow what you use** | Tap 🔔 to get a browser notification while the page is open, or use the free RSS feed when it's closed |
| **Private by design** | No cookies, no analytics, nothing loaded from other websites |
| **Free forever** | Runs entirely on free GitHub features: Actions and Pages |

## What it looks like

- **The answer on top:** for example "4 tools have problems right now", with a search box: *"Which tool isn't working for you?"*
- **"Meeting didn't start?"** One tap checks every meeting tool. That button exists because of the story above.
- **Official logos** taken from each company's own status page, so you recognise tools instantly.
- **Display options:** three themes (Light · Dark · High contrast), three fonts (Modern · Easy to read · Friendly) and three languages (English · Deutsch · हिन्दी).
- **Phone first:** two-line cards, swipeable filters and a bottom-sheet for details. It works down to 320px wide screens.

## How it works

<p align="center">
  <img src="docs/assets/architecture.svg" alt="Animated diagram: a GitHub Action reads 43 public status pages every 10 minutes, runs tests, writes status.json and RSS feeds, and deploys them to GitHub Pages. Your browser only talks to GitHub Pages and refreshes every 60 seconds." width="100%">
</p>

1. **Every ~10–15 minutes** the collector reads the public status pages of 43 services, in 9 different formats such as Statuspage, AWS Health, Azure RSS, Google incidents and Slack. It runs on GitHub Actions, or on any computer (see [Hosting without GitHub Actions](#hosting-without-github-actions)).
2. **The collector turns every format into one simple status** (working · some problems · down · maintenance · can't check), remembers when it changed, and writes `status.json` plus an RSS feed per service.
3. **GitHub Pages serves the static site.** There is no server code and no database.
4. **Your browser loads only that site** and checks for updates every minute. It never contacts the companies, trackers or CDNs…
5. **…unless you press "Check live now".** Then your browser reads 36 of the status feeds directly, so the answer is fresh even when the collector hasn't run for a while. This happens only when you choose it, and it is explained on the privacy page.

### Code architecture (onion layers)

```
   ┌─────────────────────────── main.js (wires everything) ───────────────────────────┐
   │  ┌──────────── adapters · infrastructure · ui · i18n (talk to the world) ──────┐  │
   │  │  ┌──────────────── application (use cases + ports) ──────────────────────┐  │  │
   │  │  │  ┌──────────────── domain (pure rules, no I/O) ───────────────────┐   │  │  │
   │  │  │  │  status · catalog · history · search · summary · validation    │   │  │  │
   │  │  │  └────────────────────────────────────────────────────────────────┘   │  │  │
   │  │  └────────────────────────────────────────────────────────────────────────┘  │  │
   │  └───────────────────────────────────────────────────────────────────────────────┘  │
   └───────────────────────────────────────────────────────────────────────────────────────┘
```

The collector (`collector/`) and the website (`web/js/`) both use these layers, and they share no code. They meet only at `status.json`, whose format is documented in [docs/DATA_CONTRACT.md](docs/DATA_CONTRACT.md). An architecture test fails the build if an inner layer ever imports an outer one.

See **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** for the full map and a "where do I change X?" table.

## Quick start

Requires Node 20 or later. There's nothing to install.

```bash
npm test          # 62 tests: providers, domain, live check, i18n, contract, architecture, security
npm run collect   # fetch live statuses → web/data/status.json + web/feeds/
npm run dev       # preview at http://127.0.0.1:8080
npm run publish   # collect + publish the site to the gh-pages branch (no GitHub Actions needed)
npm run icons     # refresh official icons from each status page (review the diff)
```

## Project structure

```
config/services.json   the 43 services we watch (add or remove one here)
collector/             runs on GitHub Actions or your PC: domain · application · adapters · infrastructure
web/                   the static website: index.html · privacy.html · css/ · js/ · icons/ · fonts/
tests/                 node:test + saved real provider responses (fixtures/)
docs/                  ARCHITECTURE.md · DATA_CONTRACT.md · assets/architecture.svg
tools/                 dev-server.js · publish.js · schedule-windows.ps1 · fetch-icons.js
data/history.json      when each service last changed (committed only when something changes)
```

## Security, privacy and EU law

I built it to be safe and lawful by default. Full details are in [SECURITY.md](SECURITY.md) and on the site's [Privacy & legal page](https://codemitvishal.github.io/is-it-just-me/privacy.html).

| Topic | How it's handled |
|---|---|
| **GDPR** | No personal data is collected. The privacy notice (English + German) explains hosting by GitHub Pages (Art. 6(1)(f), EU–US Data Privacy Framework), your rights (Art. 15–21) and complaints (Art. 77). |
| **Cookies / ePrivacy / TDDDG § 25** | No cookies. Local storage keeps only your own choices (theme, font, language, followed services), which counts as strictly necessary, so **no consent banner is needed**. Every key is listed on the privacy page, and a test makes sure that list stays complete. |
| **Third parties** | None by default. Fonts and icons are self-hosted, which avoids the 2022 Munich "Google Fonts" problem. No CDN, analytics or ads. "Check live now" contacts the providers only when you press it (Art. 6(1)(a), disclosed in English and German), and only hosts on a fixed allow-list. |
| **Trademarks** | Logos only identify each service and come from that company's public status page. No affiliation is implied, and rights holders can request removal. |
| **Accessibility (EAA / WCAG 2.2 AA)** | Full keyboard support, screen-reader labels, status shown by shape and text, a high-contrast theme, an easy-to-read font for low vision (Atkinson Hyperlegible) and reduced motion. |
| **Web security** | A strict Content-Security-Policy (same origin only, no inline code), all text rendered with `textContent`, https-only links, `no-referrer`, and [`security.txt`](web/.well-known/security.txt). |
| **Supply chain** | Zero npm dependencies, Actions pinned to commit SHAs, Dependabot, and least-privilege workflow permissions. |

> Not legal advice. This is a private, non-commercial project. If you run a commercial copy in Germany, you may also need an Impressum (§ 5 DDG).

## Hosting without GitHub Actions

The live site runs **without GitHub Actions**, so it costs nothing and keeps working even if Actions is unavailable (for example while an account is locked for billing).

| Job | How it's done for free |
|---|---|
| **Serve the site** | GitHub Pages deploys from the `gh-pages` branch using its own built-in build |
| **Refresh the data** | `npm run publish` on any computer collects fresh statuses and force-pushes `web/` to `gh-pages` |
| **Refresh automatically** | `tools/schedule-windows.ps1` runs the publisher every 15 minutes while the PC is on (on macOS/Linux, use cron: `*/15 * * * * cd /path/to/repo && node tools/publish.js`) |
| **Fresh answers when the PC is off** | Visitors can press **Check live now** to read 36 providers directly in their browser |

Set it up on your own computer:

```powershell
git clone https://github.com/CodeMitVishal/is-it-just-me.git
cd is-it-just-me
npm test
npm run publish                                                  # first publish
powershell -ExecutionPolicy Bypass -File tools\schedule-windows.ps1   # every 15 min
```

To stop it, run `tools\schedule-windows.ps1 -Remove`. The log is written to `data/publish.log`.

### With GitHub Actions (optional)

If Actions is available on your account, the workflow in `.github/workflows/status.yml` does everything in the cloud: tests first, then collect and deploy, every 10 minutes. To use it:

1. Enable it on the Actions tab.
2. Set **Settings → Pages → Source** to **GitHub Actions**.
3. Stop the local schedule.

GitHub pauses scheduled workflows after ~60 days without repo activity.

## Known limits

- **Microsoft Teams, Microsoft 365, Webex and Workday** publish no public live feed, so they honestly show "Can't check" with a link to the official page.
- **Data can lag.** The saved data is only as fresh as the last collector run. Without Actions, that means only while the publishing PC is on. The page warns when data is more than 45 minutes old and offers **Check live now**, which covers every provider except AWS, Azure and Stripe (they don't allow browser access).
- **Notifications** work only while the page is open. Use the RSS feeds for alerts when it's closed.

## Credits and license

Code: [MIT](LICENSE). Fonts: Inter, Atkinson Hyperlegible Next, Nunito and Noto Sans Devanagari ([SIL OFL](web/fonts/OFL.txt)). Logos are trademarks of their owners, and the project isn't affiliated with any company shown.
