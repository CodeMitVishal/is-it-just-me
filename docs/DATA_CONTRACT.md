# Data contract: `web/data/status.json`

Written by the collector, read by the website. Both sides validate it independently. The collector does it in `collector/domain/snapshot.js` and the website in `web/js/domain/snapshot.js`. `tests/contract.test.js` checks that the two agree.

```jsonc
{
  "generatedAt": "2026-11-21T10:00:00.000Z",   // ISO time of the run
  "services": [
    {
      "id": "zoom",                    // [a-z0-9-]{1,40}, unique
      "name": "Zoom",
      "sub": "Meet, Gmail, Drive",     // optional short description
      "aka": "meeting call video",     // optional extra search words
      "cat": "meet",                   // meet | dev | cloud | ai | hr | work
      "page": "https://status.zoom.us/",  // official status page, https only
      "icon": "icons/zoom.png",        // optional: official logo inside web/ (icons/<id>.png|ico|svg|webp|jpg)
      "state": "maint",                // ok | minor | down | maint | unknown
      "details": ["Zoom Phone India Maintenance …"],  // provider's own words (English), max 4, empty when ok
      "since": "2026-11-21T09:40:00.000Z",  // optional: when the current state began (only if a change was observed)
      "noFeed": true,                  // optional: the provider publishes no public live status
      "live": { "kind": "statuspage", "url": "https://…/summary.json" }  // optional: feed a browser may read on "Check live now"
    }
  ]
}
```

## Rules

- **`unknown` means "we couldn't check".** It is never shown as working.
- **`details` text comes from the provider.** The collector strips HTML and caps its length, and the website shows it with `textContent` only.
- **Unknown values in the website.** A state or category the website doesn't know becomes `unknown` or `work`, and a non-https `page` is dropped.
- **Adding a field** is backward compatible. **Renaming or removing** one requires changing both sides and the contract test.

## Other generated files

- `web/feeds/<id>.xml` and `web/feeds/all.xml` are Atom feeds of state changes, built from `data/history.json`.
- `data/history.json` is committed by the Action only when a state changes, and is not deployed.
