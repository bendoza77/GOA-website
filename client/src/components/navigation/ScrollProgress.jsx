import { useEffect, useRef } from "react";

/**
 * ScrollProgress — thin neon bar pinned to the very top of the viewport.
 * Writes the scaleX transform straight to the DOM from a rAF-coalesced
 * scroll listener — zero React re-renders while scrolling.
 */
const ScrollProgress = () => {
  const barRef = useRef(null);

  useEffect(() => {
    let frame;
    const update = () => {
      frame = undefined;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`;
    };
    const onScroll = () => {
      if (frame === undefined) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-[70] h-[2px] bg-transparent">
      <div
        ref={barRef}
        className="h-full w-full origin-left bg-gradient-to-r from-green via-lime to-neon shadow-[0_0_10px_rgba(125,255,158,0.6)]"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
};

export default ScrollProgress;
