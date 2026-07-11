import { useEffect, useState } from "react";

/* The hero cube docks into a right-hand slot that only exists at the `lg`
   breakpoint, so the whole cube act is a desktop-only treat — on phones and
   tablets it is cancelled entirely (no runway, no canvas). 1024px matches
   Tailwind's `lg`. */
const DESKTOP_QUERY = "(min-width: 1024px)";

const matches = () =>
  typeof window !== "undefined" && window.matchMedia(DESKTOP_QUERY).matches;

/**
 * useIsDesktop — true at the `lg` breakpoint and up, reactive to viewport
 * resize / orientation change.
 */
export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(matches);
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isDesktop;
}

export default useIsDesktop;
