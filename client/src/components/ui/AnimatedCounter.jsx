import { useEffect, useRef } from "react";
import { useInView } from "framer-motion";

/**
 * AnimatedCounter — counts up from 0 to `value` when scrolled into view.
 * Respects decimals and appends an optional suffix (e.g. "k", "%", "+").
 * The ticking number is written straight to the DOM from a rAF loop, so the
 * count-up costs zero React re-renders.
 */
const AnimatedCounter = ({ value, suffix = "", decimals = 0, duration = 1600, className }) => {
  const ref = useRef(null);
  const numberRef = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!inView) return;
    const format = (n) =>
      n.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      // ease-out-expo
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      if (numberRef.current) numberRef.current.textContent = format(value * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration, decimals]);

  return (
    <span ref={ref} className={className}>
      <span ref={numberRef}>
        {(0).toLocaleString("en-US", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}
      </span>
      {suffix}
    </span>
  );
};

export default AnimatedCounter;
