import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { HERO_STATS } from "../../data/stats.js";
import { staggerContainer, fadeUp } from "../../utils/motion.js";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import Icon from "../ui/Icon.jsx";
import AnimatedCounter from "../ui/AnimatedCounter.jsx";

/**
 * Hero — the first CONTENT act of Home, arriving after the CinematicIntro's
 * pure-3D opening. It sits two viewports down, so its entrance is scroll-
 * triggered (whileInView): as the 3D portal bursts behind it, the copy rises
 * in staggered — headline, lead, CTAs, stats — the "world hands over to the
 * page" moment. The right half stays open sky for the journey scene.
 */
const Hero = () => {
  /* Scroll-out parallax — as the user scrolls onward, the copy drifts up and
     dissolves, handing the frame back to the 3D world between sections. */
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -110]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.65, 1], [1, 0.4, 0]);

  return (
  <section
    ref={sectionRef}
    className="relative flex min-h-screen items-center overflow-hidden pt-28 pb-16 sm:pt-32"
  >
    {/* Volumetric light rays — two soft diagonal beams falling through the
        digital atmosphere. Pure gradients + blur, compositor-only. */}
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute -top-1/3 left-[22%] h-[150%] w-36 rotate-[22deg] blur-2xl"
        style={{
          background:
            "linear-gradient(to bottom, color-mix(in srgb, var(--color-lime) 14%, transparent), color-mix(in srgb, var(--color-lime) 4%, transparent) 55%, transparent)",
        }}
      />
      <div
        className="absolute -top-1/3 right-[16%] h-[140%] w-24 -rotate-[16deg] blur-2xl"
        style={{
          background:
            "linear-gradient(to bottom, color-mix(in srgb, var(--color-neon) 11%, transparent), color-mix(in srgb, var(--color-neon) 3%, transparent) 55%, transparent)",
        }}
      />
    </div>

    <div className="container-goa relative grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
      {/* Left — copy, rising step-by-step as it scrolls into view */}
      <motion.div
        variants={staggerContainer(0.12)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.35 }}
        style={{ y: copyY, opacity: heroOpacity }}
        className="flex flex-col items-start gap-6"
      >
        <motion.div variants={fadeUp}>
          <Badge dot pixel tone="neon">
            Cohort 12 · Now enrolling
          </Badge>
        </motion.div>

        <motion.h1 variants={fadeUp} className="h-hero text-balance">
          Engineer your
          <br />
          future in{" "}
          <span className="text-gradient-green">code</span>
          <span className="text-neon animate-blink">_</span>
        </motion.h1>

        <motion.p variants={fadeUp} className="lead max-w-xl">
          A premium, outcome-driven programming academy. Learn by building real
          software, mentored by engineers who ship at the companies you admire.
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4">
          <Button to="/courses" size="lg" magnetic glow cursorLabel="Explore">
            Explore courses
            <Icon name="ArrowRight" className="size-4" />
          </Button>
          <Button to="/about" size="lg" variant="secondary" cursorLabel="Watch">
            <Icon name="PlayCircle" className="size-4" />
            How it works
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={fadeUp}
          className="mt-4 grid w-full grid-cols-2 gap-6 border-t border-slate-line pt-8 sm:grid-cols-4"
        >
          {HERO_STATS.map((s) => (
            <div key={s.label}>
              <div className="font-display text-2xl font-bold text-snow sm:text-3xl">
                <AnimatedCounter value={s.value} suffix={s.suffix} decimals={s.decimals} className="text-gradient-green" />
              </div>
              <p className="mt-1 text-xs text-fog">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Right — open stage: the journey scene (portal burst → gathering AI
          core) plays here unobstructed. No DOM on purpose. */}
      <div aria-hidden="true" className="hidden min-h-[420px] lg:block" />
    </div>
  </section>
  );
};

export default Hero;
