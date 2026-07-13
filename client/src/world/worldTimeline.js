/**
 * worldTimeline — the master scroll timeline of the GOA digital world.
 *
 * The entire experience is ONE continuous scroll journey. This file is the
 * single source of truth for its shape: the total runway length and the
 * fractional window of every chapter. Both the 3D engine (worldEngine) and
 * the DOM overlay (WorldOverlay) read from here, so picture and copy can
 * never drift out of sync.
 *
 * All windows are fractions of total scroll progress (0..1).
 */

/** Total scroll runway in viewport-heights. The world spans exactly this. */
export const WORLD_VH = 1500;

/** Number of course artifacts along the digital road. */
export const COURSE_COUNT = 6;

const COURSES_START = 0.115;
const COURSES_END = 0.475;
const COURSE_SPAN = (COURSES_END - COURSES_START) / COURSE_COUNT;

export const CHAPTERS = {
  /** The camera descends into the digital universe; atmosphere fades in. */
  arrival: [0.0, 0.06],
  /** The glowing road begins to build itself out of energy. */
  roadIntro: [0.055, 0.115],
  /** Six course artifacts along the road (see courseWindow). */
  courses: [COURSES_START, COURSES_END],
  /** The world dims; the story typography takes the frame. */
  story: [0.475, 0.575],
  /** Three floating videos, one at a time, film-edit transitions. */
  videos: [0.575, 0.72],
  /** Thousands of cubes assemble the G; the camera circles it. */
  gMark: [0.715, 0.845],
  /** The world dissolves upward into stars and a single green point. */
  finale: [0.845, 1.0],
};

/** Scroll window of course artifact `i` (0-based). */
export const courseWindow = (i) => [
  COURSES_START + i * COURSE_SPAN,
  COURSES_START + (i + 1) * COURSE_SPAN,
];

/** Scroll window of video `i` of `count` inside the videos chapter. */
export const videoWindow = (i, count = 3) => {
  const [a, b] = CHAPTERS.videos;
  const span = (b - a) / count;
  return [a + i * span, a + (i + 1) * span];
};

/** Linear 0..1 ramp of `p` across [a, b] (clamped). */
export const ramp = (p, a, b) => Math.min(1, Math.max(0, (p - a) / (b - a)));

/** Smoothstep 0..1 of `p` across [a, b]. */
export const sstep = (p, a, b) => {
  const t = ramp(p, a, b);
  return t * t * (3 - 2 * t);
};

/** Bell curve: 0 → 1 → 0 across a window, with eased shoulders.
 *  `inFrac` / `outFrac` set how much of the window the rise/fall occupy. */
export const bell = (p, a, b, inFrac = 0.3, outFrac = 0.3) => {
  const inEnd = a + (b - a) * inFrac;
  const outStart = b - (b - a) * outFrac;
  return sstep(p, a, inEnd) * (1 - sstep(p, outStart, b));
};
