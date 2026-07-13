import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslation } from "react-i18next";
import { LogoMark } from "../../components/ui/Logo.jsx";
import { useCursor } from "../../hooks/useCursor.js";
import { CHAPTERS } from "../worldTimeline.js";

/**
 * FinaleMoment — the last light of the journey.
 *
 * As the G disperses and the camera leaves the world, one closing line
 * plays, then the entire universe compresses into a single glowing green
 * point that shrinks, flares, and goes out. Black. Silence. Then — softly —
 * the mark, one sentence, and a single invitation to travel again.
 * No footer. No links. The world simply completes.
 */
const FinaleMoment = () => {
  const { t } = useTranslation();
  const { cursorProps } = useCursor();
  const [a] = CHAPTERS.finale;
  const { scrollYProgress } = useScroll();

  /* closing line while the world dissolves */
  const lineOpacity = useTransform(
    scrollYProgress,
    [a + 0.01, a + 0.035, a + 0.075, a + 0.095],
    [0, 1, 1, 0]
  );
  const lineY = useTransform(scrollYProgress, [a + 0.01, a + 0.035], [40, 0]);

  /* the universe becomes a single green point… */
  const pointOpacity = useTransform(
    scrollYProgress,
    [0.9, 0.93, 0.975, 0.988],
    [0, 1, 1, 0]
  );
  const pointScale = useTransform(scrollYProgress, [0.9, 0.94, 0.985], [2.8, 1.4, 0.12]);

  /* …then black */
  const blackout = useTransform(scrollYProgress, [0.955, 0.985], [0, 1]);

  /* …then the quiet ending */
  const endOpacity = useTransform(scrollYProgress, [0.985, 0.998], [0, 1]);
  const endY = useTransform(scrollYProgress, [0.985, 0.998], [24, 0]);

  const travelAgain = () => {
    if (window.__lenis) window.__lenis.scrollTo(0, { duration: 3.2 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="pointer-events-none fixed inset-0">
      <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
        <motion.h2
          style={{ opacity: lineOpacity, y: lineY }}
          className="max-w-3xl px-6 text-center font-display text-3xl font-bold tracking-tight text-snow sm:text-5xl"
        >
          {t("world.finale.line1")}
        </motion.h2>
      </div>

      {/* the glowing green point the universe collapses into */}
      <motion.div
        aria-hidden="true"
        style={{ opacity: blackout }}
        className="absolute inset-0 bg-black"
      />
      <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
        <motion.div
          style={{ opacity: pointOpacity, scale: pointScale }}
          className="size-24 rounded-full"
        >
          <div
            className="h-full w-full rounded-full"
            style={{
              background:
                "radial-gradient(circle, #eafff0 0%, #7dff9e 22%, rgba(47,191,95,0.65) 45%, transparent 72%)",
              filter: "blur(1px)",
            }}
          />
        </motion.div>
      </div>

      {/* the ending — mark, sentence, one invitation */}
      <motion.div
        style={{ opacity: endOpacity, y: endY }}
        className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-6 text-center"
      >
        <LogoMark size={64} className="drop-shadow-[0_0_36px_rgba(125,255,158,0.55)]" />
        <p className="font-display text-2xl font-bold tracking-tight text-snow sm:text-4xl">
          {t("world.finale.end")}
        </p>
        <button
          type="button"
          onClick={travelAgain}
          className="pointer-events-auto rounded-full border border-neon/30 px-8 py-3 font-mono text-xs font-semibold uppercase tracking-[0.35em] text-neon transition-all duration-500 hover:border-neon/70 hover:bg-neon/10 hover:shadow-[0_0_50px_-12px_rgba(125,255,158,0.6)]"
          {...cursorProps("button")}
        >
          {t("world.finale.cta")}
        </button>
      </motion.div>
    </div>
  );
};

export default FinaleMoment;
