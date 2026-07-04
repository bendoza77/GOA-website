/** Small pure helpers shared across the UI. */

export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const lerp = (a, b, t) => a + (b - a) * t;

export const mapRange = (value, inMin, inMax, outMin, outMax) =>
  outMin + ((value - inMin) * (outMax - outMin)) / (inMax - inMin);

/** Format a number like 1200 → "1.2k", 15000 → "15k". */
export const formatCompact = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${n}`;
};

/** Deterministic pseudo-random from a seed — stable particle layouts. */
export const seededRandom = (seed) => {
  const x = Math.sin(seed * 9973.13) * 43758.5453;
  return x - Math.floor(x);
};

export const scrollToId = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};
