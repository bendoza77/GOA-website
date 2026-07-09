import { useState } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";

/* Home's opening is a chrome-free 3D sequence:
     0 → 7vh    the scroll-journey ride (CinematicIntro's 700vh runway)
     7 → 10vh   the hero-cube act (CubeStage's 300vh runway): the cube drops
                in, reveals every face, then travels into the hero
   Chrome (navbar, scroll bar, footer) must stay hidden through ALL of that and
   only enter while the cube is travelling into the hero — so the reveal order
   is: cube → header → hero. 9.2vh lands mid-travel (cube runway progress ~0.7),
   after which the Hero's own in-view reveal brings the hero copy up. */
export const RIDE_VH = 9.2;

/**
 * useRideComplete — true once the user has scrolled past Home's chrome-free
 * opening (intro ride + cube act) to the point the cube is entering the hero.
 * Drives the step-by-step chrome entrance: the header, scroll bar and footer
 * stay out of the frame until then, so nothing is visible before the cube
 * animation is over.
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
