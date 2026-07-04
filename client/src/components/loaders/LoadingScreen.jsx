import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogoMark } from "../ui/Logo.jsx";

/**
 * LoadingScreen — first-paint intro overlay. Counts to 100 while the app
 * mounts, then wipes away to reveal the site. Shows once per session.
 */
const LoadingScreen = ({ minDuration = 1400 }) => {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min((now - start) / minDuration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(Math.round(eased * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setTimeout(() => setDone(true), 220);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [minDuration]);

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
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-green to-neon"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="font-mono text-xs tracking-[0.3em] text-fog">
              {String(progress).padStart(3, "0")}% · INITIALISING
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
