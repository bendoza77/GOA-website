import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "../../utils/cn.js";
import { RIDE_VH, RIDE_STORY_VH, PROLOGUE_VH } from "../worldTimeline.js";

/**
 * PrologueRide — act one of the prologue: the original scroll-driven 3D
 * story (journeyEngine) on a fixed, pointer-transparent canvas, plus the
 * scroll runway that gives it its timeline.
 *
 * The ride's story — holographic laptop → portal burst → code universe →
 * AI core + neural links → learning pathway → pixel-G → exit gate —
 * completes at RIDE_STORY_VH viewport-heights and holds its starfield
 * finale as the living backdrop for the cube act that follows. The canvas
 * then fades out under the world's arrival and the engine goes to sleep.
 *
 * The three.js chunk is imported during idle time after the page is
 * interactive and cross-fades in once live (no pop-in).
 */
const PrologueRide = () => {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);

  /* Hand the frame to the world: the ride's backdrop dims away across the
     last stretch of the cube act. (Same window.innerHeight idiom the old
     ScrollJourney used — a resize mid-visit shifts the fade by a few vh,
     which the damped world reveal absorbs invisibly.) */
  const { scrollY } = useScroll();
  const vh = typeof window !== "undefined" ? window.innerHeight : 900;
  const fade = useTransform(
    scrollY,
    [vh * (PROLOGUE_VH / 100 - 1.2), vh * (PROLOGUE_VH / 100 - 0.15)],
    [1, 0]
  );

  useEffect(() => {
    let engine = null;
    let disposed = false;
    let idleId;

    const boot = async () => {
      const { JourneyEngine } = await import("./journeyEngine.js");
      if (disposed || !canvasRef.current) return;
      engine = new JourneyEngine(canvasRef.current, {
        isDark: true, // the world is dark by design
        coarse: window.matchMedia("(pointer: coarse)").matches,
        storyVh: RIDE_STORY_VH,
        sleepVh: PROLOGUE_VH / 100 + 0.5, // idle once the world owns the frame
      });
      engine.start();
      setReady(true);
    };

    /* The scene IS the opening content — boot at first idle with a tight
       deadline, off the critical path but live before the intro loader
       clears. */
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
      setReady(false);
    };
  }, []);

  return (
    <>
      <motion.div style={{ opacity: fade }} className="pointer-events-none fixed inset-0 z-[1]">
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className={cn(
            "h-full w-full transition-opacity duration-1000",
            ready ? "opacity-100" : "opacity-0"
          )}
        />
      </motion.div>
      {/* the ride's scroll runway — pure height, zero DOM in the frame */}
      <section aria-hidden="true" className="relative" style={{ height: `${RIDE_VH}vh` }} />
    </>
  );
};

export default PrologueRide;
