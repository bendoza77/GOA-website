import { motion, useScroll, useTransform } from "framer-motion";
import { useAnimationContext } from "../../context/AnimationContext.jsx";

/**
 * CinematicIntro — act one of Home: the scroll runway for the pure-3D ride.
 * Seven viewports of empty height that give the scroll-journey scene its
 * full timeline (storyVh: 6): the user rides the camera through the whole
 * story — laptop → portal burst → AI core + neural links → learning pathway
 * → pixel-G → exit gate — with zero DOM in the frame. The ride completes
 * exactly where this section ends, and the content acts (navbar, hero,
 * sections, footer) render step-by-step from there.
 *
 * The single element inside is a wordless scroll cue that dissolves on the
 * first input. Nothing here when animations are off — Home starts straight
 * at its classic content.
 */
const CinematicIntro = () => {
  const { animationsOn } = useAnimationContext();

  const { scrollY } = useScroll();
  const cueOpacity = useTransform(
    scrollY,
    [0, typeof window !== "undefined" ? window.innerHeight * 0.5 : 450],
    [1, 0]
  );

  if (!animationsOn) return null;

  return (
    <section aria-hidden="true" className="relative h-[700vh]">
      {/* keeps the cue on screen until scrolling starts, then releases it */}
      <div className="sticky top-0 flex h-screen items-end justify-center pb-10">
        <motion.span
          style={{ opacity: cueOpacity }}
          className="flex h-9 w-5 items-start justify-center rounded-full border border-slate-line p-1"
        >
          <span
            className="size-1.5 rounded-full bg-lime"
            style={{
              "--drift-y": "12px",
              animation: "goa-drift 1.6s ease-in-out infinite",
            }}
          />
        </motion.span>
      </div>
    </section>
  );
};

export default CinematicIntro;
