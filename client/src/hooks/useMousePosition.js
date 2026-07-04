import { useEffect, useRef, useState } from "react";

/**
 * useMousePosition — normalised pointer position for parallax / glow tracking.
 * Returns { x, y } in pixels and { nx, ny } normalised to -1..1 from centre.
 * `disabled` (e.g. touch / reduced-motion) short-circuits the listener.
 */
export function useMousePosition({ disabled = false } = {}) {
  const [pos, setPos] = useState({ x: 0, y: 0, nx: 0, ny: 0 });
  const frame = useRef();

  useEffect(() => {
    if (disabled) return;
    const onMove = (e) => {
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        const nx = (e.clientX / window.innerWidth) * 2 - 1;
        const ny = (e.clientY / window.innerHeight) * 2 - 1;
        setPos({ x: e.clientX, y: e.clientY, nx, ny });
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(frame.current);
    };
  }, [disabled]);

  return pos;
}

export default useMousePosition;
