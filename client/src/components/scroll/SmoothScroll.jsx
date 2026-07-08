import { useEffect } from "react";
import Lenis from "lenis";
import { useAnimationContext } from "../../context/AnimationContext.jsx";

/**
 * SmoothScroll — Lenis-powered inertial scrolling for the whole app.
 *
 * Every scroll-driven system (JourneyEngine, AmbientEngine, ScrollProgress,
 * Framer Motion useScroll) reads native window scroll each frame, so easing
 * the scroll itself gives the entire 3D world momentum and glide for free —
 * the camera, particles and reveals all inherit the same inertia.
 *
 * Skipped on coarse pointers (native touch momentum already feels right and
 * hijacking it hurts more than it helps) and when animations are off
 * (prefers-reduced-motion), so accessibility stays intact.
 */
const SmoothScroll = () => {
  const { animationsOn } = useAnimationContext();

  useEffect(() => {
    if (!animationsOn) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const lenis = new Lenis({
      lerp: 0.1, // glide weight — low enough to feel cinematic, never laggy
      wheelMultiplier: 1,
      anchors: true, // in-page #hash links ease instead of jumping
    });

    let raf = requestAnimationFrame(function loop(t) {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    });

    /* Let route-change resets (ScrollToTop) cancel any in-flight glide. */
    window.__lenis = lenis;

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      delete window.__lenis;
    };
  }, [animationsOn]);

  return null;
};

export default SmoothScroll;
