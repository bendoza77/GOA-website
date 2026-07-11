import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import { useTranslation } from "react-i18next";
import Section from "../layout/Section.jsx";
import SectionTitle from "../ui/SectionTitle.jsx";
import GlassPanel from "../ui/GlassPanel.jsx";
import Icon from "../ui/Icon.jsx";
import Reveal from "../ui/Reveal.jsx";
import { useServiceProcess } from "../../data/services.js";
import { useAnimationContext } from "../../context/AnimationContext.jsx";
import { useIsDesktop } from "../../hooks/useIsDesktop.js";
import { accent as accentOf } from "../../utils/accents.js";
import { cn } from "../../utils/cn.js";

/**
 * ServiceProcess3D — the signature scroll-driven 3D corridor.
 *
 * A tall scroll runway pins a perspective stage; as you scroll, the four
 * process cards fly through the camera along the z-axis — each one rising from
 * the depths, resting centre-frame, then sweeping forward and out as the next
 * arrives. A smoothed spring drives every transform so the scrub stays liquid.
 *
 * The whole 3D act is a desktop treat: on touch/small screens or under
 * reduced-motion it degrades to a clean numbered stack (StackFallback), so the
 * content is always complete and accessible.
 */

const CARD_INNER = (step, a) => (
  <>
    <div className="mb-6 flex items-center gap-4">
      <div
        className={cn(
          "grid size-14 shrink-0 place-items-center rounded-2xl border",
          a.bg,
          a.border,
          a.text
        )}
      >
        <Icon name={step.icon} className="size-7" strokeWidth={1.8} />
      </div>
      <span className={cn("eyebrow", a.text)}>{step.name}</span>
    </div>
    <h3 className="h2 mb-4 text-snow">{step.title}</h3>
    <p className="lead !text-fog">{step.desc}</p>
  </>
);

/* One card in the perspective corridor. Owns its own scroll-linked transforms
   so the hooks aren't called in a loop. `progress` is the shared smoothed
   spring; `d = progress*(total-1) - index` is the card's signed distance from
   centre frame (0 = dead centre). */
const CorridorCard = ({ step, index, total, progress }) => {
  const a = accentOf(step.accent);
  const span = total - 1;

  const z = useTransform(progress, (p) => {
    const d = p * span - index;
    return d > 0 ? d * 620 : d * 340; // forward past camera vs. receding behind
  });
  const y = useTransform(progress, (p) => (p * span - index) * -70);
  const rotateX = useTransform(progress, (p) => -(p * span - index) * 9);
  const opacity = useTransform(progress, (p) =>
    Math.max(0, 1 - Math.abs(p * span - index))
  );
  const blur = useTransform(progress, (p) => {
    const d = Math.abs(p * span - index);
    return `blur(${Math.min(d * 6, 8)}px)`;
  });

  return (
    <motion.div
      style={{ z, y, rotateX, opacity, filter: blur }}
      className="absolute inset-x-0 mx-auto w-full max-w-xl [transform-style:preserve-3d] [backface-visibility:hidden]"
    >
      <GlassPanel
        glow
        className={cn(
          "p-8 shadow-[0_50px_120px_-40px_rgba(0,0,0,0.95)] sm:p-11",
          a.glow
        )}
      >
        <span className="pointer-events-none absolute right-6 top-5 select-none font-display text-7xl font-bold leading-none text-mist/[0.05]">
          {String(index + 1).padStart(2, "0")}
        </span>
        {CARD_INNER(step, a)}
      </GlassPanel>
    </motion.div>
  );
};

/* Left-hand progress rail — a filling spine plus a node per stage that lights
   up as its card takes centre frame. */
const ProgressRail = ({ steps, progress, active }) => {
  const fill = useTransform(progress, (p) => p);
  return (
    <div className="pointer-events-none absolute left-6 top-1/2 hidden -translate-y-1/2 lg:block xl:left-12">
      <div className="relative flex flex-col gap-10">
        <div className="absolute left-[7px] top-1 h-full w-px bg-slate-line" />
        <motion.div
          style={{ scaleY: fill }}
          className="absolute left-[7px] top-1 h-full w-px origin-top bg-gradient-to-b from-green via-lime to-neon"
        />
        {steps.map((step, i) => {
          const on = i <= active;
          return (
            <div key={step.id ?? i} className="relative flex items-center gap-4">
              <span
                className={cn(
                  "relative z-10 size-4 rounded-full border-2 transition-all duration-500",
                  on ? "border-neon bg-neon shadow-[0_0_16px_rgba(125,255,158,0.8)]" : "border-ash bg-carbon"
                )}
              />
              <span
                className={cn(
                  "font-mono text-xs uppercase tracking-widest transition-colors duration-500",
                  i === active ? "text-neon" : on ? "text-mist" : "text-fog/60"
                )}
              >
                {step.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* Accessible, motion-free fallback: the same four stages as a numbered stack. */
const StackFallback = ({ steps }) => (
  <div className="mx-auto mt-14 grid max-w-3xl gap-5">
    {steps.map((step, i) => {
      const a = accentOf(step.accent);
      return (
        <Reveal key={step.id ?? i} delay={i * 0.05}>
          <GlassPanel className="relative flex flex-col gap-4 p-7 sm:flex-row sm:items-start sm:gap-6">
            <div
              className={cn(
                "grid size-14 shrink-0 place-items-center rounded-2xl border",
                a.bg,
                a.border,
                a.text
              )}
            >
              <Icon name={step.icon} className="size-7" strokeWidth={1.8} />
            </div>
            <div>
              <div className="mb-2 flex items-center gap-3">
                <span className="font-mono text-xs text-fog">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={cn("eyebrow", a.text)}>{step.name}</span>
              </div>
              <h3 className="h3 mb-2 text-snow">{step.title}</h3>
              <p className="text-sm leading-relaxed text-fog">{step.desc}</p>
            </div>
          </GlassPanel>
        </Reveal>
      );
    })}
  </div>
);

const ServiceProcess3D = () => {
  const { t } = useTranslation();
  const steps = useServiceProcess();
  const { animationsOn } = useAnimationContext();
  const isDesktop = useIsDesktop();
  const use3D = animationsOn && isDesktop && steps.length > 1;

  const wrapRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 30,
    mass: 0.4,
  });

  const [active, setActive] = useState(0);
  useMotionValueEvent(progress, "change", (p) => {
    const idx = Math.round(p * (steps.length - 1));
    setActive((prev) => (prev === idx ? prev : idx));
  });

  const header = (
    <SectionTitle
      eyebrow={t("servicesPage.process.eyebrow")}
      title={t("servicesPage.process.title")}
      description={t("servicesPage.process.description")}
    />
  );

  if (!use3D) {
    return (
      <Section id="process">
        {header}
        <StackFallback steps={steps} />
      </Section>
    );
  }

  return (
    <section id="process" className="relative">
      <Section className="!pb-0">{header}</Section>

      {/* Scroll runway — one screen of travel per stage, plus a lead-in. */}
      <div ref={wrapRef} style={{ height: `${(steps.length + 0.5) * 100}vh` }} className="relative">
        <div className="sticky top-0 flex h-screen items-center overflow-hidden">
          {/* depth wash so cards read against the moving ambience */}
          <div className="glow-orb left-1/2 top-1/2 size-[42rem] -translate-x-1/2 -translate-y-1/2 opacity-30" />

          <div className="container-goa relative">
            <ProgressRail steps={steps} progress={progress} active={active} />
            <div className="relative mx-auto h-[26rem] w-full [perspective:1400px]">
              {steps.map((step, i) => (
                <CorridorCard
                  key={step.id ?? i}
                  step={step}
                  index={i}
                  total={steps.length}
                  progress={progress}
                />
              ))}
            </div>
            {/* scroll hint */}
            <div className="mt-6 flex items-center justify-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.25em] text-fog">
              <Icon name="ArrowDown" className="size-3.5 animate-bounce" />
              {t("common.step")} {active + 1} / {steps.length}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceProcess3D;
