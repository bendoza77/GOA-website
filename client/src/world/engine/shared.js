import { CanvasTexture } from "three";

/** Deterministic pseudo-random — stable world layouts across visits. */
export const mulberry = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** Soft radial white blob — additive glow sprites/planes fade to nothing at
 *  their edges. Tinted by the material that maps it. */
export const makeGlowTexture = (size = 128) => {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const g = c.getContext("2d");
  const half = size / 2;
  const grad = g.createRadialGradient(half, half, size * 0.04, half, half, half);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.4, "rgba(255,255,255,0.4)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return new CanvasTexture(c);
};

/** Vertical light-shaft gradient — bright core fading out along both axes. */
export const makeRayTexture = () => {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 256;
  const g = c.getContext("2d");
  const v = g.createLinearGradient(0, 0, 0, 256);
  v.addColorStop(0, "rgba(255,255,255,0)");
  v.addColorStop(0.45, "rgba(255,255,255,0.9)");
  v.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = v;
  g.fillRect(0, 0, 64, 256);
  const h = g.createLinearGradient(0, 0, 64, 0);
  h.addColorStop(0, "rgba(0,0,0,1)");
  h.addColorStop(0.5, "rgba(0,0,0,0)");
  h.addColorStop(1, "rgba(0,0,0,1)");
  g.globalCompositeOperation = "destination-out";
  g.fillStyle = h;
  g.fillRect(0, 0, 64, 256);
  return new CanvasTexture(c);
};

/* GOA world palette — the world is dark-only by design. */
export const PALETTE = {
  green: 0x2fbf5f,
  lime: 0x57e08a,
  neon: 0x7dff9e,
  deep: 0x12693a,
};
