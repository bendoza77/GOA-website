---
name: verify
description: Build, serve, and drive the GOA client (Vite/React SPA) in headless Chrome to verify changes at the browser surface.
---

# Verify the GOA client

## Build + serve

```powershell
cd client
npm run build          # vite build → client/dist
npm run preview        # serves dist at http://localhost:4173 (run in background)
```

## Drive it (headless Chrome)

No test framework in the repo. Use `playwright-core` (no browser download) with
the system Chrome via `channel: "chrome"`:

```js
const { chromium } = require("playwright-core");
const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--headless=new"] });
```

Install `playwright-core` in a scratchpad dir, not in the repo.

## Flows worth driving

- **Intro loader**: shows on first visit (text "INITIALISING"), must NOT replay
  on reload in the same session (sessionStorage key `goa-intro-shown`).
- **Spline deferral**: no `react-spline`/`physics`/`opentype`/`spline.design`
  requests before scrolling; scroll `#interactive-3d` into view → chunks stream.
- **Route prefetch**: after ~4s idle on Home, all page chunks (`Courses-*`,
  `Blog-*`, …) should already be in the request log; SPA nav must not flash
  the "LOADING" PageLoader.
- **Custom cursor**: ring (`div[class*="z-[9999]"]`) must have a centered
  `translate3d` transform even with zero mouse input, and track `page.mouse.move`.
- **Theme toggle**: `button[aria-label*="mode"]` flips `<html data-theme>`.
- Watch `page.on("console")` + `pageerror` — the app should log zero errors.

## Gotchas

- Headless Chrome reports `prefers-color-scheme: light` → site renders light
  theme by default; pass `colorScheme: "dark"` to `newContext` to test dark.
- The repo root has no package.json — all npm commands run from `client/`.
