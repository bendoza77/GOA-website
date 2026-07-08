import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { HERO_STATS } from "../../data/stats.js";
import { staggerContainer, fadeUp } from "../../utils/motion.js";
import { onIntroDone } from "../../utils/introGate.js";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import Icon from "../ui/Icon.jsx";
import AnimatedCounter from "../ui/AnimatedCounter.jsx";
import HeroRobot from "../3d/HeroRobot.jsx";
import ParticleField from "../backgrounds/ParticleField.jsx";
import AnimatedGrid from "../backgrounds/AnimatedGrid.jsx";

/* Play the entrance once per full page load (fresh visit or refresh) —
   SPA navigations back to Home show the hero settled, not replaying. */
let entrancePlayed = false;

/**
 * Hero — the visual identity of GOA. Split layout: value proposition + CTAs +
 * live stats on the left, interactive 3D focal point on the right, over a
 * perspective matrix grid and drifting particle network.
 *
 * The entrance (text rising bottom→top, staggered) is held until the intro
 * LoadingScreen wipes away, so on first visit/refresh the user actually sees
 * it instead of it finishing under the overlay.
 *
 * To wire a real Spline model, pass a scene URL to <HeroRobot scene="..." />.
 */
const Hero = () => {
  // "static" → already played this load; "wait" → hold hidden until intro
  // clears; "play" → run the entrance now. The entrance must always start in
  // "wait" and flip via state: the layout's <AnimatePresence initial={false}>
  // suppresses mount-time initial animations, so only an animate-prop change
  // reliably triggers the rise.
  const [phase, setPhase] = useState(() => (entrancePlayed ? "static" : "wait"));

  useEffect(() => {
    entrancePlayed = true;
    if (phase === "wait") return onIntroDone(() => setPhase("play"));
  }, [phase]);

  const isStatic = phase === "static";
  const show = phase !== "wait";

  /* Scroll-out parallax — as the user scrolls past the hero, copy and visual
     drift apart at different depths and dissolve, handing the frame over to
     the 3D journey (the laptop → portal transformation) behind it. */
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -110]);
  const visualY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const visualScale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.65, 1], [1, 0.4, 0]);

  return (
  <section
    ref={sectionRef}
    className="relative flex min-h-screen items-center overflow-hidden pt-28 pb-16 sm:pt-32"
  >
    {/* Local ambience layered above the global backdrop */}
    <AnimatedGrid perspective className="opacity-70" />
    <ParticleField className="opacity-70" />

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
      {/* Left — copy */}
      <motion.div
        variants={staggerContainer(0.12)}
        initial={isStatic ? false : "hidden"}
        animate={show ? "show" : "hidden"}
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

      {/* Right — 3D focal point. Outer wrapper owns the scroll parallax so it
          never fights the entrance animation's own opacity/scale. */}
      <motion.div
        style={{ y: visualY, scale: visualScale, opacity: heroOpacity }}
        className="relative mx-auto h-[360px] w-full max-w-lg sm:h-[460px] lg:h-[560px]"
      >
        <motion.div
          initial={isStatic ? false : { opacity: 0, scale: 0.9 }}
          animate={show ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="h-full w-full"
        >
          <HeroRobot />
        </motion.div>
      </motion.div>
    </div>

    {/* Scroll cue */}
    <motion.div
      initial={isStatic ? false : { opacity: 0 }}
      animate={{ opacity: show ? 1 : 0 }}
      transition={{ delay: isStatic ? 0 : 1.2 }}
      className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-fog sm:flex"
    >
      <span className="font-mono text-[0.6rem] uppercase tracking-[0.3em]">Scroll</span>
      <span className="flex h-9 w-5 items-start justify-center rounded-full border border-slate-line p-1">
        <span
          className="size-1.5 rounded-full bg-lime"
          style={{ "--drift-y": "12px", animation: "goa-drift 1.6s ease-in-out infinite" }}
        />
      </span>
    </motion.div>
  </section>
  );
};

export default Hero;
