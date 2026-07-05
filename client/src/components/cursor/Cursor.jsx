import { useEffect, useRef, useState } from "react";
import { useCursorContext } from "../../context/CursorContext.jsx";
import { useAnimationContext } from "../../context/AnimationContext.jsx";

/**
 * Cursor — bespoke two-part cursor (precise dot + trailing ring).
 * The ring lerps toward the pointer for a smooth, weighty feel and grows /
 * labels itself based on the CursorContext variant. Desktop + fine-pointer
 * only; falls back to the native cursor everywhere else.
 */
const Cursor = () => {
  const { variant, label } = useCursorContext();
  const { animationsOn } = useAnimationContext();
  const ringRef = useRef(null);
  const dotRef = useRef(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine || !animationsOn) return;
    setEnabled(true);
    document.body.classList.add("goa-custom-cursor");

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ring = { x: target.x, y: target.y };
    let raf = 0;

    const render = () => {
      const el = ringRef.current;
      ring.x += (target.x - ring.x) * 0.18;
      ring.y += (target.y - ring.y) * 0.18;
      if (el) {
        el.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) translate(-50%, -50%)`;
      }
      // Park the loop once the ring exists and has settled on the pointer;
      // mousemove wakes it again. (Never park before the ref attaches — the
      // first frames run while the component is still mounting.)
      const settled =
        el && Math.abs(target.x - ring.x) < 0.1 && Math.abs(target.y - ring.y) < 0.1;
      raf = settled ? 0 : requestAnimationFrame(render);
    };

    const onMove = (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }
      if (!raf) raf = requestAnimationFrame(render);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      document.body.classList.remove("goa-custom-cursor");
    };
  }, [animationsOn]);

  if (!enabled) return null;

  const isButton = variant === "button";
  const isText = variant === "text";

  return (
    <>
      {/* Trailing ring */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] grid place-items-center rounded-full border border-neon/70 transition-[width,height,background-color,opacity] duration-300 ease-out"
        style={{
          width: isButton ? 64 : isText ? 12 : 34,
          height: isButton ? 64 : isText ? 12 : 34,
          backgroundColor: isButton ? "rgba(125,255,158,0.12)" : "transparent",
          mixBlendMode: "difference",
        }}
      >
        {isButton && label && (
          <span className="font-mono text-[0.6rem] uppercase tracking-widest text-neon">
            {label}
          </span>
        )}
      </div>
      {/* Precise dot */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] size-1.5 rounded-full bg-neon"
        style={{ opacity: isButton ? 0 : 1, mixBlendMode: "difference" }}
      />
    </>
  );
};

export default Cursor;
