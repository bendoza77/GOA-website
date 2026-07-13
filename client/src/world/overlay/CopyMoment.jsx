import { motion, useScroll, useTransform, useMotionTemplate } from "framer-motion";
import { cn } from "../../utils/cn.js";

/**
 * CopyMoment — a piece of cinematic typography bound to a scroll window.
 *
 * The whole world speaks through these: short statements that rise into the
 * frame, hold while their chapter plays, and release upward as the journey
 * moves on. No boxes, no cards — just light-weight type floating over the
 * universe. Every instance is fixed, pointer-transparent and GPU-cheap
 * (opacity/transform/filter only).
 */
const POSITIONS = {
  center: "items-center justify-center text-center",
  lower: "items-end justify-center pb-[16vh] text-center",
  left: "items-center justify-start pl-[7vw] text-left",
  right: "items-center justify-end pr-[7vw] text-right",
};

const CopyMoment = ({
  window: [a, b],
  enter = 0.28,
  exit = 0.22,
  position = "center",
  eyebrow,
  index,
  title,
  sub,
  meta,
  big = false,
  className,
}) => {
  const span = b - a;
  const inEnd = a + span * enter;
  const outStart = b - span * exit;

  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [a, inEnd, outStart, b], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [a, inEnd, outStart, b], [56, 0, 0, -44]);
  const blurPx = useTransform(scrollYProgress, [a, inEnd, outStart, b], [10, 0, 0, 8]);
  const filter = useMotionTemplate`blur(${blurPx}px)`;

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none fixed inset-0 flex", POSITIONS[position])}
    >
      <motion.div
        style={{ opacity, y, filter }}
        className={cn("flex max-w-2xl flex-col gap-4 px-6", className)}
      >
        {(eyebrow || index) && (
          <span className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.45em] text-neon">
            {index && <span className="mr-3 text-lime/70">{index}</span>}
            {eyebrow}
          </span>
        )}
        {title && (
          <h2
            className={cn(
              "font-display font-bold tracking-tight text-snow",
              big ? "text-4xl sm:text-6xl lg:text-7xl" : "text-3xl sm:text-5xl"
            )}
            style={{ textShadow: "var(--text-halo)" }}
          >
            {title}
          </h2>
        )}
        {sub && (
          <p className="text-base leading-relaxed text-mist sm:text-lg" style={{ textShadow: "var(--text-halo)" }}>
            {sub}
          </p>
        )}
        {meta && (
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-fog">
            {meta}
          </span>
        )}
      </motion.div>
    </div>
  );
};

export default CopyMoment;
