import { useEffect, useRef, useState } from "react";
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
      });
      engine.start();
      setReady(true);
    };

    if ("requestIdleCallback" in window) {
      idleId = requestIdleCallback(boot, { timeout: 2500 });
    } else {
      idleId = setTimeout(boot, 900);
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
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed inset-0 -z-[5] h-full w-full transition-opacity duration-1000",
        ready ? "opacity-100" : "opacity-0"
      )}
    />
  );
};

export default ScrollJourney;
