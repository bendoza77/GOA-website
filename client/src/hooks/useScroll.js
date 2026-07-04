import { useEffect, useState } from "react";

/**
 * useScroll — page scroll telemetry:
 *  - y: scrollTop in px
 *  - progress: 0..1 through the document
 *  - direction: "up" | "down"
 *  - scrolled: past a small threshold (for navbar background)
 */
export function useScroll(threshold = 24) {
  const [state, setState] = useState({
    y: 0,
    progress: 0,
    direction: "up",
    scrolled: false,
  });

  useEffect(() => {
    let lastY = window.scrollY;
    let frame;

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        const docHeight =
          document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? Math.min(y / docHeight, 1) : 0;
        setState({
          y,
          progress,
          direction: y > lastY ? "down" : "up",
          scrolled: y > threshold,
        });
        lastY = y;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [threshold]);

  return state;
}

export default useScroll;
