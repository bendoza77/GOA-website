import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { LogoMark } from "../../components/ui/Logo.jsx";
import LanguageToggle from "../../components/ui/LanguageToggle.jsx";

/**
 * WorldHud — the only persistent interface in the universe.
 *
 * A mark, a language switch, a hairline progress beam and the opening
 * scroll cue. Everything else is world. The HUD fades up once the intro
 * loader clears and stays whisper-quiet: no navigation, no chrome.
 */
const WorldHud = () => {
  const { scrollYProgress } = useScroll();
  const beam = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 });
  /* the cue dissolves on first travel; the HUD dims out at the very end */
  const cueOpacity = useTransform(scrollYProgress, [0, 0.012], [1, 0]);
  const hudOpacity = useTransform(scrollYProgress, [0.955, 0.985], [1, 0]);

  return (
    <motion.header style={{ opacity: hudOpacity }} className="fixed inset-x-0 top-0 z-40">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 1.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between px-5 py-4 sm:px-8"
      >
        <span className="inline-flex items-center gap-2.5 font-display font-bold tracking-tight">
          <LogoMark size={34} className="drop-shadow-[0_0_12px_rgba(125,255,158,0.35)]" />
          <span className="text-lg leading-none text-snow">
            GOA
            <span className="ml-1 hidden font-mono text-[0.6rem] font-normal tracking-[0.2em] text-fog sm:inline">
              ACADEMY
            </span>
          </span>
        </span>
        <LanguageToggle className="pointer-events-auto" />
      </motion.div>

      {/* journey beam — a hairline of energy tracking progress through the world */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/5">
        <motion.div
          className="h-full origin-left bg-gradient-to-r from-green via-lime to-neon shadow-[0_0_12px_rgba(125,255,158,0.8)]"
          style={{ scaleX: beam }}
        />
      </div>

      {/* opening scroll cue */}
      <motion.div
        style={{ opacity: cueOpacity }}
        className="pointer-events-none fixed inset-x-0 bottom-10 flex justify-center"
      >
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 2.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex h-9 w-5 items-start justify-center rounded-full border border-slate-line p-1"
        >
          <span
            className="size-1.5 rounded-full bg-lime"
            style={{ "--drift-y": "12px", animation: "goa-drift 1.6s ease-in-out infinite" }}
          />
        </motion.span>
      </motion.div>
    </motion.header>
  );
};

export default WorldHud;
