import { cubicBezier, motion, useTransform } from "framer-motion";
import { useTranslation } from "react-i18next";
import { CHAPTERS } from "../worldTimeline.js";
import { useWorldProgress } from "./useWorldProgress.js";

/**
 * StoryMoment — the emotional centre of the journey.
 *
 * The world has already dimmed (the engine hushes every system across this
 * window). Into that silence, the first line descends from above with heavy
 * cinematic weight — fast at first, braking hard into place — holds…
 * and then the answer appears beneath it.
 *
 *   "This is not GOA's story."
 *            "Our story."
 */
const easeHeavy = cubicBezier(0.16, 1, 0.3, 1);

const StoryMoment = () => {
  const { t } = useTranslation();
  const [a, b] = CHAPTERS.story;
  const span = b - a;

  const progress = useWorldProgress();

  /* line one: descends from the top, brakes into the centre */
  const l1In = [a + span * 0.06, a + span * 0.4];
  const line1Y = useTransform(progress, l1In, ["-42vh", "0vh"], { ease: easeHeavy });
  const line1Opacity = useTransform(
    progress,
    [l1In[0], l1In[1], b - span * 0.12, b],
    [0, 1, 1, 0]
  );

  /* line two: a beat later, rising softly underneath */
  const l2In = [a + span * 0.52, a + span * 0.72];
  const line2Y = useTransform(progress, l2In, ["6vh", "0vh"], { ease: easeHeavy });
  const line2Opacity = useTransform(
    progress,
    [l2In[0], l2In[1], b - span * 0.12, b],
    [0, 1, 1, 0]
  );
  const line2Scale = useTransform(progress, l2In, [0.94, 1], { ease: easeHeavy });

  /* supporting darkness — a soft radial vignette closing around the words */
  const veil = useTransform(
    progress,
    [a, a + span * 0.3, b - span * 0.1, b],
    [0, 0.75, 0.75, 0]
  );

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0">
      <motion.div
        className="absolute inset-0"
        style={{
          opacity: veil,
          background:
            "radial-gradient(90% 70% at 50% 50%, rgba(1,4,2,0.55) 0%, rgba(1,4,2,0.92) 100%)",
        }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 text-center">
        <motion.h2
          style={{ y: line1Y, opacity: line1Opacity }}
          className="font-display text-4xl font-bold tracking-tight text-snow sm:text-6xl lg:text-7xl"
        >
          {t("world.story.line1")}
        </motion.h2>
        <motion.p
          style={{ y: line2Y, opacity: line2Opacity, scale: line2Scale }}
          className="font-display text-2xl font-semibold tracking-tight text-neon sm:text-4xl"
        >
          {t("world.story.line2")}
        </motion.p>
      </div>
    </div>
  );
};

export default StoryMoment;
