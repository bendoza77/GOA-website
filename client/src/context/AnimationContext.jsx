import { createContext, useContext, useEffect, useMemo, useState } from "react";

/**
 * AnimationContext — exposes a global "should we animate?" flag driven by
 * the user's prefers-reduced-motion setting, plus an opt-out toggle.
 * Heavy effects (cursor, particles, spline) can read this to bail early.
 */
const AnimationContext = createContext(null);

export const AnimationProvider = ({ children }) => {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [effectsEnabled, setEffectsEnabled] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const value = useMemo(
    () => ({
      reducedMotion,
      effectsEnabled,
      setEffectsEnabled,
      animationsOn: effectsEnabled && !reducedMotion,
    }),
    [reducedMotion, effectsEnabled]
  );

  return (
    <AnimationContext.Provider value={value}>{children}</AnimationContext.Provider>
  );
};

export const useAnimationContext = () => {
  const ctx = useContext(AnimationContext);
  if (!ctx) throw new Error("useAnimationContext must be used within <AnimationProvider>");
  return ctx;
};

export default AnimationContext;
