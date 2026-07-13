import { useEffect, useRef, useState } from "react";
import { useAnimationContext } from "../context/AnimationContext.jsx";
import { cn } from "../utils/cn.js";
import { WORLD_VH } from "./worldTimeline.js";
import PrologueRide from "./prologue/PrologueRide.jsx";
import CubeAct from "./prologue/CubeAct.jsx";
import WorldOverlay from "./overlay/WorldOverlay.jsx";
import WorldHud from "./overlay/WorldHud.jsx";
import WorldFallback from "./WorldFallback.jsx";

/**
 * WorldExperience — the site. Not a page: a journey.
 *
 * One scroll, three acts:
 *   PROLOGUE 1 — the original 3D ride: holographic laptop → portal burst →
 *                code universe → AI core → learning pathway → exit gate
 *   PROLOGUE 2 — the hero cube falls in, reveals all six faces, then
 *                releases upward into the universe
 *   THE WORLD — the moment the cube's rotation ends and scrolling
 *               continues, the arrival chapter begins: the energy road,
 *               the course artifacts, the story, the films, the cube-G
 *               monument and the dissolving finale
 *
 * Each act has its own engine on its own fixed canvas; sleep guards make
 * sure only the act that owns the frame burns GPU time. Every chunk loads
 * during idle behind the intro loader and cross-fades in — no pop-in.
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
      {/* the world's universe — asleep (transparent) until the prologue
          hands over the frame */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={cn(
          "pointer-events-none fixed inset-0 z-0 h-full w-full transition-opacity duration-1000",
          ready ? "opacity-100" : "opacity-0"
        )}
      />

      {/* prologue act one — the ride (canvas + its 700vh runway) */}
      <PrologueRide />
      {/* prologue act two — the cube (canvas + its 300vh runway) */}
      <CubeAct />

      {/* the world's runway */}
      <div aria-hidden="true" style={{ height: `${WORLD_VH}vh` }} />
      {/* the words + the only chrome */}
      <WorldOverlay />
      <WorldHud />
    </>
  );
};

export default WorldExperience;
