# Goal-Oriented Academy — Front-End

A premium, immersive, **front-end only** experience for a modern programming
academy. Green-on-black cyber/pixel identity drawn from the GOA logo, built to
compete with Awwwards-tier product sites.

> UI / UX / motion / 3D only — no backend, APIs, auth, database or business logic.

## Stack

- **React 19** + **Vite 8** (JavaScript, `.jsx` only — no TypeScript)
- **Tailwind CSS v4** (`@theme` tokens in `src/index.css`)
- **React Router** (code-split routes)
- **Framer Motion** + CSS animations
- **Lucide React** icons
- **@splinetool/react-spline** + runtime (lazy, optional 3D)

## Scripts

```bash
npm install
npm run dev        # local dev
npm run build      # production build
npm run preview    # serve the build
npm run lint       # oxlint
```

## Architecture

```
src/
  assets/            images, icons, fonts, videos
  components/
    ui/              design-system primitives (Button, GlassPanel, Badge, Logo, Icon, …)
    cards/           Feature/Course/Mentor/Testimonial/Event/Blog/Story/Pricing/Stat
    sections/        composed page sections (Hero, Features, CTA, FAQ, PageHeader, …)
    layout/          Section, Footer, ScrollToTop
    navigation/      Navbar, MobileMenu, ScrollProgress
    forms/           Input, ContactForm, Newsletter
    backgrounds/     AnimatedGrid, ParticleField, GlowOrbs, PageBackground
    cursor/          bespoke Cursor
    loaders/         LoadingScreen, PageLoader, SceneLoader
    3d/              SplineScene, HeroRobot, FloatingObjects, SceneLoader
  context/           Theme / Cursor / Navigation / Animation providers
  hooks/             useScroll, useCursor, useWindowSize, useMousePosition, useMagnetic, …
  layouts/           MainLayout (app shell + page transitions)
  pages/             Home, About, Courses, Mentors, Community, Events,
                     SuccessStories, Blog, Contact, NotFound
  routes/            AppRoutes (lazy + Suspense)
  constants/         site config, nav, socials
  data/              content (courses, mentors, testimonials, events, blog, …)
  utils/             cn, motion presets, accents, helpers
  styles/            variables / typography / animations / globals
```

## Design system

Tokens live in the Tailwind `@theme` block in `src/index.css` and generate
utilities like `bg-green`, `text-neon`, `border-lime`. Signature effect classes
(`glass-panel`, `text-gradient-green`, `bg-grid`, `glow-orb`, `border-gradient`)
live in `src/styles/globals.css`.

## Enabling the live 3D hero (Spline)

The hero ships with a fully self-contained CSS/Framer 3D fallback
(`FloatingObjects`) so it always looks great and downloads nothing extra.
To stream a real interactive Spline model, pass a scene URL:

```jsx
// src/components/sections/Hero.jsx
<HeroRobot scene="https://prod.spline.design/XXXX/scene.splinecode" />
```

`SplineScene` lazy-loads the Spline runtime **only when a scene is provided**,
shows `SceneLoader` while it streams, and automatically falls back to
`FloatingObjects` if the scene fails to load. Without a scene, the heavy runtime
chunk is never fetched.

## Accessibility & performance

- Semantic landmarks, ARIA labels, visible focus rings, keyboard-friendly nav
- `prefers-reduced-motion` fully respected (global + `AnimationContext`)
- Every route is `React.lazy` code-split; canvas effects pause off-screen
- Custom cursor only mounts on fine-pointer devices
