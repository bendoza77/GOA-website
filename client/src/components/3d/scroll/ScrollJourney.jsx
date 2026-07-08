import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useAnimationContext } from "../../../context/AnimationContext.jsx";
import { cn } from "../../../utils/cn.js";

/**
 * ScrollJourney — mounts the scroll-driven 3D story (journeyEngine) on a
 * fixed, pointer-transparent canvas layered between the page backdrop and
 * the content. The three.js chunk is imported during idle time after the
 * page is interactive, so it never competes with the initial load, and the
 * canvas cross-fades in once the scene is live (no pop-in).
 *
 * Honours prefers-reduced-motion via AnimationContext and follows the
 * data-theme attribute so colours flip with the theme toggle.
 */
const ScrollJourney = () => {
  const { animationsOn } = useAnimationContext();
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);

  /* Readability veil, scroll-timed: nonexistent for the whole pure-3D ride,
     easing in right as the ride ends and the content sections arrive. */
  const { scrollY } = useScroll();
  const veilOpacity = useTransform(
    scrollY,
    // The 700vh runway hands over to content at ~6 viewport-heights
    [
      typeof window !== "undefined" ? window.innerHeight * 5.6 : 5000,
      typeof window !== "undefined" ? window.innerHeight * 6.4 : 5800,
    ],
    [0, 1]
  );

  useEffect(() => {
    if (!animationsOn) return;
    let engine = null;
    let disposed = false;
    let idleId;

    const boot = async () => {
      const { JourneyEngine } = await import("./journeyEngine.js");
      if (disposed || !canvasRef.current) return;
      engine = new JourneyEngine(canvasRef.current, {
        isDark: document.documentElement.dataset.theme !== "light",
        coarse: window.matchMedia("(pointer: coarse)").matches,
        storyVh: 6, // the story completes at the end of the 700vh runway
      });
      engine.start();
      setReady(true);
    };

    /* The scene IS the opening content (CinematicIntro has no DOM of its
       own), so boot at first idle with a tight deadline — still off the
       critical path, but live before the intro loader clears. */
    if ("requestIdleCallback" in window) {
      idleId = requestIdleCallback(boot, { timeout: 800 });
    } else {
      idleId = setTimeout(boot, 350);
    }

    const themeObserver = new MutationObserver(() => {
      engine?.setTheme(document.documentElement.dataset.theme !== "light");
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      disposed = true;
      if ("requestIdleCallback" in window) cancelIdleCallback(idleId);
      else clearTimeout(idleId);
      themeObserver.disconnect();
      engine?.dispose();
      setReady(false);
    };
  }, [animationsOn]);

  if (!animationsOn) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={cn(
          "pointer-events-none fixed inset-0 -z-[5] h-full w-full transition-opacity duration-1000",
          ready ? "opacity-100" : "opacity-0"
        )}
      />
      {/* Readability veil — absent during the ride (full-brightness world),
          fading in over the centre column as the content chapters begin. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-[4]"
        style={{
          opacity: veilOpacity,
          background:
            "linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--color-void) 38%, transparent) 22%, color-mix(in srgb, var(--color-void) 38%, transparent) 78%, transparent 100%)",
        }}
      />
    </>
  );
};

export default ScrollJourney;
