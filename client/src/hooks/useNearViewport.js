import { useEffect, useRef, useState } from "react";

/**
 * useNearViewport — true once the referenced element approaches the viewport
 * (within `margin`). Used to defer heavy work (e.g. the multi-MB Spline
 * runtime) until the user is about to see it, then latches on forever.
 * Returns [ref, isNear].
 */
export function useNearViewport({ margin = "800px" } = {}) {
  const ref = useRef(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    if (near) return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: margin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near, margin]);

  return [ref, near];
}

export default useNearViewport;
