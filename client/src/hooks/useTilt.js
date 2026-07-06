import { useEffect, useRef } from "react";
import { useAnimationContext } from "../context/AnimationContext.jsx";

/**
 * useTilt — pointer-tracked 3D card tilt. The element leans toward the
 * cursor (rotateX/rotateY around a perspective origin) and lifts slightly,
 * then eases back on leave. Pure DOM transforms written outside React
 * (no re-renders); disabled for coarse pointers and reduced motion.
 *
 * Composes with Tailwind hover classes: transform is inline, so keep any
 * CSS hover lift off tilted elements (GlassPanel handles this).
 */
export function useTilt({ max = 5, lift = -6, disabled = false } = {}) {
  const ref = useRef(null);
  const { animationsOn } = useAnimationContext();

  useEffect(() => {
    const el = ref.current;
    if (!el || disabled || !animationsOn) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let raf = 0;

    /* transform tracks fast; border/shadow keep their slow glass ease */
    const SOFT = "border-color 0.5s, box-shadow 0.5s, background-color 0.5s";

    const onEnter = () => {
      el.style.transition = `transform 0.2s ease-out, ${SOFT}`;
    };

    const onMove = (event) => {
      const r = el.getBoundingClientRect();
      const px = (event.clientX - r.left) / r.width - 0.5;
      const py = (event.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform =
          `perspective(900px) rotateX(${(-py * max).toFixed(2)}deg) ` +
          `rotateY(${(px * max).toFixed(2)}deg) translateY(${lift}px)`;
      });
    };

    const onLeave = () => {
      cancelAnimationFrame(raf);
      el.style.transition = `transform 0.7s cubic-bezier(0.16, 1, 0.3, 1), ${SOFT}`;
      el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)";
    };

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [max, lift, disabled, animationsOn]);

  return ref;
}

export default useTilt;
