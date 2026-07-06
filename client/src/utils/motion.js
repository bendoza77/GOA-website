/**
 * motion.js — shared Framer Motion variant presets.
 * Centralised so every section animates with one consistent language.
 */

export const EASE = [0.16, 1, 0.3, 1]; // ease-out-expo
export const EASE_SPRING = [0.34, 1.56, 0.64, 1];

/* Fade + rise, great default for section content */
export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE },
  },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.8, ease: EASE } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: EASE } },
};

export const slideInLeft = {
  hidden: { opacity: 0, x: -40 },
  show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
};

export const slideInRight = {
  hidden: { opacity: 0, x: 40 },
  show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
};

/* Blur-to-focus rise — headlines and feature blocks sharpening into view */
export const blurIn = {
  hidden: { opacity: 0, y: 14, filter: "blur(10px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: EASE },
  },
};

/* Depth reveal — cards emerging from the page's z-axis */
export const depthIn = {
  hidden: { opacity: 0, scale: 0.92, y: 26 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

/* Perspective tilt-up — panels standing up into the viewport */
export const tiltIn = {
  hidden: { opacity: 0, y: 34, rotateX: 14, transformPerspective: 900 },
  show: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transformPerspective: 900,
    transition: { duration: 0.8, ease: EASE },
  },
};

/* Parent container that staggers its children */
export const staggerContainer = (stagger = 0.09, delay = 0) => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
});

/* Standard viewport config for scroll-triggered reveals */
export const viewportOnce = { once: true, amount: 0.25 };

/* Page transition used by the router — rise + a whisper of depth. Scale
   settles at exactly 1 so the transform clears after the transition and
   fixed-position children (scene canvases) stay viewport-anchored. */
export const pageTransition = {
  initial: { opacity: 0, y: 20, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: EASE } },
  exit: { opacity: 0, y: -14, scale: 0.995, transition: { duration: 0.3, ease: EASE } },
};
