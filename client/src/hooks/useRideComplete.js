import { useState } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";

/* The Home 3D ride is a 700vh runway → 6 viewport-heights of scroll drive
   the story 0..1. Chrome (navbar, scroll bar, footer) enters just before the
   first content section reaches the frame. */
export const RIDE_VH = 5.7;

/**
 * useRideComplete — true once the user has scrolled past Home's pure-3D
 * story. Drives the step-by-step chrome entrance: everything that isn't the
 * 3D world stays out of the frame until the ride is over.
 */
export function useRideComplete() {
  const { scrollY } = useScroll();
  const [past, setPast] = useState(
    () =>
      typeof window !== "undefined" &&
      window.scrollY > window.innerHeight * RIDE_VH
  );
  useMotionValueEvent(scrollY, "change", (v) => {
    setPast(v > window.innerHeight * RIDE_VH);
  });
  return past;
}

export default useRideComplete;
