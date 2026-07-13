import { useScroll, useTransform } from "framer-motion";
import { WORLD_OFFSET_FRAC } from "../worldTimeline.js";

/**
 * useWorldProgress — the world's scroll progress (0..1) as a MotionValue.
 *
 * The document begins with the prologue (ride + cube); the world's chapters
 * occupy the remainder. Every overlay moment positions itself in WORLD
 * space, so the whole overlay retimes automatically if the prologue or the
 * world changes length — the mapping lives here and in worldTimeline only.
 */
export const useWorldProgress = () => {
  const { scrollYProgress } = useScroll();
  return useTransform(scrollYProgress, [WORLD_OFFSET_FRAC, 1], [0, 1]);
};
