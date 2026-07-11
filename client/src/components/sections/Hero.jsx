import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAnimationContext } from "../../context/AnimationContext.jsx";
import { useHeroStats } from "../../data/stats.js";
import { staggerContainer, fadeUp } from "../../utils/motion.js";
import { cn } from "../../utils/cn.js";
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
  const { t } = useTranslation();
  const { animationsOn } = useAnimationContext();
  const heroStats = useHeroStats();

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
    <div className="container-goa relative grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
      {/* Left — copy, rising step-by-step as it scrolls into view. On mobile
          it sits BELOW the cube slot (order-2); on desktop it's the left
          column (order-1). */}
      <motion.div
        variants={staggerContainer(0.12)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.35 }}
        style={{ y: copyY, opacity: heroOpacity }}
        className="order-2 flex flex-col items-start gap-6 lg:order-1"
      >
        <motion.div variants={fadeUp}>
          <Badge dot pixel tone="neon">
            {t("hero.badge")}
          </Badge>
        </motion.div>

        <motion.h1 variants={fadeUp} className="h-hero text-balance">
          {t("hero.title")}{" "}
          <span className="text-gradient-green">{t("hero.titleHighlight")}</span>
          <span className="text-neon animate-blink">_</span>
        </motion.h1>

        <motion.p variants={fadeUp} className="lead max-w-xl">
          {t("hero.lead")}
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4">
          <Button to="/courses" size="lg" magnetic glow cursorLabel="Explore">
            {t("hero.exploreCourses")}
            <Icon name="ArrowRight" className="size-4" />
          </Button>
          <Button to="/about" size="lg" variant="secondary" cursorLabel="Watch">
            <Icon name="PlayCircle" className="size-4" />
            {t("hero.howItWorks")}
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={fadeUp}
          className="mt-4 grid w-full grid-cols-2 gap-6 pt-8 sm:grid-cols-4"
        >
          {heroStats.map((s) => (
            <div key={s.label}>
              <div className="font-display text-2xl font-bold text-snow sm:text-3xl">
                <AnimatedCounter value={s.value} suffix={s.suffix} decimals={s.decimals} className="text-gradient-green" />
              </div>
              <p className="mt-1 text-xs text-fog">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Cube dock. The hero cube act (CubeStage) flies in and pixel-locks to
          this slot, becoming part of the hero. Kept empty on purpose; id is the
          dock target the CubeEngine tracks. Now present on EVERY breakpoint so
          the cube has somewhere to land on phones/tablets too (previously
          `lg`-only, which left the cube nowhere to dock and it vanished on
          scroll). On mobile it's a centred visual ABOVE the copy (order-1);
          on desktop the reserved right column. Only reserved when animations
          are on — with reduced motion there's no cube, so no empty gap. */}
      <div
        id="hero-cube-slot"
        aria-hidden="true"
        className={cn(
          "order-1 w-full lg:order-2 lg:min-h-[420px] lg:block",
          animationsOn
            ? "block h-[40vh] min-h-[240px] lg:h-auto"
            : "hidden"
        )}
      />
    </div>
  </section>
  );
};

export default Hero;
