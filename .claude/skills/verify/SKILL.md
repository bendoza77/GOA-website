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
- **Spline staging**: no `react-spline`/`spline.design` requests during the
  initial load window (first ~4s); an idle warmup (window load + 4.5s + idle)
  then streams the runtime chunk and `.splinecode` so the near-viewport mount
  of `#interactive-3d` is cache-hot. Scrolling to the section before warmup
  fires must still stream + render the scene (path unchanged). Low-end
  contexts (`saveData` / `deviceMemory <= 2`) must never request Spline and
  render the FloatingObjects fallback instead.
- **Route prefetch**: after ~4s idle on Home, all page chunks (`Courses-*`,
  `Blog-*`, …) should already be in the request log; SPA nav must not flash
  the "LOADING" PageLoader.
- **Custom cursor**: ring (`div[class*="z-[9999]"]`) must have a centered
  `translate3d` transform even with zero mouse input, and track `page.mouse.move`.
- **Theme toggle**: `button[aria-label*="mode"]` flips `<html data-theme>`.
- **3D scroll journey (Home)**: fixed `canvas[class*="-z-"]` mounts ~1–2.5s
  after load (idle-deferred three.js chunk `journeyEngine-*`); canvas pixels
  must differ across scroll fractions 0/.25/.5/.75/1 (scroll-driven story);
  canvas is removed on navigation to another route and remounts on return;
  `reducedMotion: "reduce"` context must never mount it; theme toggle
  recolours the scene.
- Watch `page.on("console")` + `pageerror` — the app should log zero errors.

## Gotchas

- Headless Chrome reports `prefers-color-scheme: light` → site renders light
  theme by default; pass `colorScheme: "dark"` to `newContext` to test dark.
- The repo root has no package.json — all npm commands run from `client/`.
