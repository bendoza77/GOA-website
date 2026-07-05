import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { markIntroDone } from "../../utils/introGate.js";
import { LogoMark } from "../ui/Logo.jsx";

const SESSION_KEY = "goa-intro-shown";

const wasIntroShown = () => {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
};

/**
 * LoadingScreen — first-paint intro overlay. Counts to 100 while the app
 * mounts, then wipes away to reveal the site. Shows once per session —
 * reloads and return visits within the tab skip straight to the page.
 *
 * The counter/bar are driven by direct DOM writes from a single rAF loop
 * (no per-frame React re-renders), so the app hydrates undisturbed under it.
 */
const LoadingScreen = ({ minDuration = 1400 }) => {
  const [done, setDone] = useState(wasIntroShown);
  const barRef = useRef(null);
  const counterRef = useRef(null);

  useEffect(() => {
    if (done) {
      markIntroDone(); // loader skipped this session — page is ready now
      return;
    }
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* private mode — intro will simply replay next load */
    }

    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min((now - start) / minDuration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const progress = Math.round(eased * 100);
      if (barRef.current) barRef.current.style.width = `${progress}%`;
      if (counterRef.current) {
        counterRef.current.textContent = `${String(progress).padStart(3, "0")}% · INITIALISING`;
      }
      if (t < 1) raf = requestAnimationFrame(tick);
      else {
        setTimeout(() => {
          markIntroDone(); // hero entrance starts as the overlay wipes away
          setDone(true);
        }, 220);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [done, minDuration]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[200] grid place-items-center bg-void"
          exit={{ opacity: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }}
        >
          <div className="absolute inset-0 bg-grid bg-grid-fade opacity-40" />
          <div className="relative flex flex-col items-center gap-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="animate-float"
            >
              <LogoMark size={72} className="drop-shadow-[0_0_30px_rgba(125,255,158,0.5)]" />
            </motion.div>

            <div className="font-display text-lg font-bold tracking-tight text-snow">
              GOAL-ORIENTED <span className="text-gradient-green">ACADEMY</span>
            </div>

            {/* Progress bar */}
            <div className="h-[3px] w-56 overflow-hidden rounded-full bg-graphite">
              <div
                ref={barRef}
                className="h-full rounded-full bg-gradient-to-r from-green to-neon"
                style={{ width: "0%" }}
              />
            </div>
            <div ref={counterRef} className="font-mono text-xs tracking-[0.3em] text-fog">
              000% · INITIALISING
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
