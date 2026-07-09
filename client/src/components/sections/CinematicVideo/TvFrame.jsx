import { motion } from "framer-motion";

/**
 * TvFrame — the physical television that the fullscreen video morphs into.
 * Purely presentational: every animated value is a Framer motion value passed
 * from useTvScroll, so this component just wires them to compositor-only
 * properties (transform / border-radius / box-shadow / opacity).
 *
 * Structure, back to front:
 *   unit    scales + tilts as one (the whole set)
 *   bezel   dark metallic frame; its thickness (padding) grows to reveal the
 *           frame around the screen — at zero padding the screen is full-bleed
 *   screen  rounded, clips the media; carries a glass sheen on top
 *   chrome  brand label + power LED, fading in once the panel is formed
 *   stand   neck + base, rising in under the seated TV
 *
 * `children` is the screen media (procedural cinema canvas or a real <video>).
 */
const TvFrame = ({ m, children }) => (
  <motion.div
    className="absolute inset-0 flex items-center justify-center [transform-style:preserve-3d]"
    style={{ scale: m.scale, rotateX: m.rotateX, rotateY: m.rotateY }}
  >
    {/* the set — full viewport at scale 1 (fullscreen cinema) */}
    <div className="relative h-full w-full">
      {/* bezel / frame */}
      <motion.div
        className="absolute inset-0 overflow-hidden"
        style={{
          padding: m.bezelPad,
          borderRadius: m.bezelRadius,
          boxShadow: m.shadow,
          background:
            "linear-gradient(150deg, #10201a 0%, #060d0a 45%, #020604 100%)",
        }}
      >
        {/* bezel top-edge highlight (metallic catch-light) */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: m.bezelOpacity,
            borderRadius: m.bezelRadius,
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.10), inset 0 0 40px -10px rgba(125,255,158,0.25)",
          }}
        />

        {/* screen */}
        <motion.div
          className="relative h-full w-full overflow-hidden bg-black"
          style={{ borderRadius: m.screenRadius }}
        >
          {children}

          {/* glass sheen — a soft diagonal reflection across the panel */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              opacity: m.sheenOpacity,
              background:
                "linear-gradient(120deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 35%, rgba(255,255,255,0) 70%, rgba(125,255,158,0.06) 100%)",
            }}
          />
        </motion.div>

        {/* brand chrome — label + power LED on the bezel chin */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 pb-1.5"
          style={{ opacity: m.chromeOpacity }}
        >
          <span className="size-1.5 rounded-full bg-neon shadow-[0_0_8px_var(--glow-color-2)]" />
          <span className="font-display text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-fog">
            GOA
          </span>
        </motion.div>
      </motion.div>

      {/* stand — neck + base, rising under the seated set */}
      <motion.div
        aria-hidden="true"
        className="absolute left-1/2 top-full flex -translate-x-1/2 flex-col items-center"
        style={{ opacity: m.chromeOpacity, scaleY: m.standScaleY, originY: 0 }}
      >
        <div className="h-6 w-10 bg-gradient-to-b from-[#10201a] to-[#060d0a]" />
        <div className="h-2 w-40 rounded-b-lg rounded-t-sm bg-gradient-to-b from-[#152a20] to-[#040a06] shadow-[0_16px_30px_-16px_rgba(0,0,0,0.9)]" />
      </motion.div>
    </div>
  </motion.div>
);

export default TvFrame;
