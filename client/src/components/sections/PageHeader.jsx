import { motion } from "framer-motion";
import Badge from "../ui/Badge.jsx";
import ParticleField from "../backgrounds/ParticleField.jsx";
import { useAnimationContext } from "../../context/AnimationContext.jsx";
import { staggerContainer, fadeUp, EASE } from "../../utils/motion.js";
import { cn } from "../../utils/cn.js";

/**
 * PageHeader — consistent inner-page hero: eyebrow badge, large title,
 * lede + optional children (filters, stats). Sits over the shared backdrop
 * with a local particle field for continuity with the home hero.
 *
 * The title reveals word by word — each word rises out of its own clip
 * mask with a soft blur-to-focus — with the gradient highlight joining
 * last. Falls back to a static title under reduced motion.
 */

/* Word-level variants: h1 staggers, words rise + sharpen. */
const titleContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.05 } },
};

const wordRise = {
  hidden: { y: "105%", opacity: 0, filter: "blur(6px)" },
  show: {
    y: "0%",
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.75, ease: EASE },
  },
};

/** One clipped, animated word. Space rendered outside the clip mask. */
const Word = ({ children, gradient = false }) => (
  <>
    <span className="inline-block overflow-hidden align-bottom">
      <motion.span
        variants={wordRise}
        className={cn("inline-block", gradient && "text-gradient-green")}
      >
        {children}
      </motion.span>
    </span>{" "}
  </>
);

const AnimatedTitle = ({ title, highlight }) => (
  <>
    {title.split(" ").map((w, i) => (
      <Word key={`t-${i}`}>{w}</Word>
    ))}
    {highlight &&
      highlight.split(" ").map((w, i) => (
        <Word key={`h-${i}`} gradient>
          {w}
        </Word>
      ))}
  </>
);

const PageHeader = ({ eyebrow, title, highlight, description, children, className }) => {
  const { animationsOn } = useAnimationContext();

  return (
    <header className={cn("relative overflow-hidden pt-36 pb-16 sm:pt-40", className)}>
      <ParticleField className="opacity-50" />
      <div className="container-goa relative">
        <motion.div
          variants={staggerContainer(0.1)}
          initial="hidden"
          animate="show"
          className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center"
        >
          {eyebrow && (
            <motion.div variants={fadeUp}>
              <Badge dot pixel tone="neon">{eyebrow}</Badge>
            </motion.div>
          )}
          {animationsOn && typeof title === "string" ? (
            <motion.h1 variants={titleContainer} className="h1 text-balance">
              <AnimatedTitle title={title} highlight={highlight} />
            </motion.h1>
          ) : (
            <motion.h1 variants={fadeUp} className="h1 text-balance">
              {title}
              {highlight && <> <span className="text-gradient-green">{highlight}</span></>}
            </motion.h1>
          )}
          {description && (
            <motion.p variants={fadeUp} className="lead">
              {description}
            </motion.p>
          )}
          {children && <motion.div variants={fadeUp} className="w-full">{children}</motion.div>}
        </motion.div>
      </div>
    </header>
  );
};

export default PageHeader;
