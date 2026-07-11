import { useState } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";

/* Home's opening is a chrome-free 3D sequence. Its length depends on the
   breakpoint, because the hero-cube act is desktop-only:

     Desktop (lg+):
       0 → 7vh    the scroll-journey ride (CinematicIntro's 700vh runway)
       7 → 10vh   the hero-cube act (CubeStage's 300vh runway): the cube drops
                  in, reveals every face, then travels into the hero
       9.2vh lands mid-travel (cube runway progress ~0.7): chrome enters while
       the cube is flying into the hero — reveal order cube → header → hero.

     Mobile / tablet (< lg):
       the cube act is cancelled, so the opening is JUST the 700vh journey;
       chrome enters as the journey hands over to content (~6.4vh), so the
       navbar is present the moment the hero copy arrives — never a hero
       without chrome. */
const DESKTOP_RIDE_VH = 9.2; // journey + cube act
const MOBILE_RIDE_VH = 6.4; // journey only

/* 9.2 kept as the public constant for back-compat; the hook picks the right
   one for the current viewport. */
export const RIDE_VH = DESKTOP_RIDE_VH;

const rideVh = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(min-width: 1024px)").matches
    ? DESKTOP_RIDE_VH
    : MOBILE_RIDE_VH;

/**
 * useRideComplete — true once the user has scrolled past Home's chrome-free
 * opening (intro ride, plus the cube act on desktop) to the point the content
 * takes over. Drives the step-by-step chrome entrance: the header, scroll bar
 * and footer stay out of the frame until then, so nothing is visible before
 * the opening animation is over.
 */
export function useRideComplete() {
  const { scrollY } = useScroll();
  const [past, setPast] = useState(
    () =>
      typeof window !== "undefined" &&
      window.scrollY > window.innerHeight * rideVh()
  );
  useMotionValueEvent(scrollY, "change", (v) => {
    setPast(v > window.innerHeight * rideVh());
  });
  return past;
}

export default useRideComplete;
