import { motion } from "framer-motion";
import { fadeUp } from "../../utils/motion.js";

/**
 * Reveal — scroll-triggered entrance wrapper.
 * Wrap any block to fade + rise it into view once. `delay` staggers manually,
 * `variants` overrides the animation, `as` swaps the element.
 */
const Reveal = ({
  children,
  className,
  delay = 0,
  y = 28,
  once = true,
  amount = 0.25,
  as = "div",
  ...rest
}) => {
  const MotionTag = motion[as] || motion.div;
  const variants = {
    hidden: { opacity: 0, y },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: fadeUp.show.transition.ease, delay },
    },
  };

  return (
    <MotionTag
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
};

export default Reveal;
