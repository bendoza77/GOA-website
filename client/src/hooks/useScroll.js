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

/**
 * useScrolled — lean variant for components that only care whether the page
 * is past a threshold (e.g. the navbar background). Re-renders exactly when
 * the boolean flips instead of on every scroll frame.
 */
export function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(window.scrollY > threshold);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return scrolled;
}

export default useScroll;
