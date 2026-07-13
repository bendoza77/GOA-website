import { useEffect, useRef, useState } from "react";
import { useAnimationContext } from "../context/AnimationContext.jsx";
import { cn } from "../utils/cn.js";
import { WORLD_VH } from "./worldTimeline.js";
import WorldOverlay from "./overlay/WorldOverlay.jsx";
import WorldHud from "./overlay/WorldHud.jsx";
import WorldFallback from "./WorldFallback.jsx";

/**
 * WorldExperience — the site. Not a page: a journey.
 *
 * Three layers, one timeline:
 *   1. a fixed canvas running the WorldEngine (the universe itself)
 *   2. a tall, empty scroll runway (WORLD_VH) — the story's length
 *   3. a fixed DOM overlay speaking the copy at the right scroll windows
 *
 * The engine chunk (three.js) loads during idle after first paint, behind
 * the intro loader, and the canvas cross-fades in once live — no pop-in.
 * With animations off (prefers-reduced-motion or the user toggle) the whole
 * journey is replaced by a calm, static narrative of the same story.
 */
const WorldExperience = () => {
  const { animationsOn } = useAnimationContext();

  /* The world is dark by design — deep space, green light. */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
  }, []);

  if (!animationsOn) return <WorldFallback />;
  return <WorldStage />;
};

const WorldStage = () => {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let engine = null;
    let disposed = false;
    let idleId;

    const boot = async () => {
      const { WorldEngine } = await import("./engine/worldEngine.js");
      if (disposed || !canvasRef.current) return;
      engine = new WorldEngine(canvasRef.current, {
        coarse: window.matchMedia("(pointer: coarse)").matches,
      });
      engine.start();
      setReady(true);
    };

    /* The scene IS the content — boot at first idle with a tight deadline,
       off the critical path but live before the intro loader clears. */
    if ("requestIdleCallback" in window) {
      idleId = requestIdleCallback(boot, { timeout: 800 });
    } else {
      idleId = setTimeout(boot, 350);
    }

    return () => {
      disposed = true;
      if ("requestIdleCallback" in window) cancelIdleCallback(idleId);
      else clearTimeout(idleId);
      engine?.dispose();
    };
  }, []);

  return (
    <>
      {/* layer 1 — the universe */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={cn(
          "pointer-events-none fixed inset-0 z-0 h-full w-full transition-opacity duration-1000",
          ready ? "opacity-100" : "opacity-0"
        )}
      />
      {/* layer 2 — the journey's length */}
      <div aria-hidden="true" style={{ height: `${WORLD_VH}vh` }} />
      {/* layer 3 — the words + the only chrome */}
      <WorldOverlay />
      <WorldHud />
    </>
  );
};

export default WorldExperience;
