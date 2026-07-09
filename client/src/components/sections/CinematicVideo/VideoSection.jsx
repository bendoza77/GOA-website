import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useAnimationContext } from "../../../context/AnimationContext.jsx";
import { useTvScroll } from "./useTvScroll.js";
import TvFrame from "./TvFrame.jsx";
import Icon from "../../ui/Icon.jsx";

/* Cinematic footage for the TV — bundled from src/assets/videos at build time
   (glob avoids hard-coding the unicode filename). Falls back to the procedural
   loop if no file is present. */
const VIDEO_SRC =
  Object.values(
    import.meta.glob("../../../assets/videos/*.{mp4,webm,mov}", {
      eager: true,
      import: "default",
    })
  )[0] || null;

/**
 * CinemaScreen — the media inside the TV. Renders a real <video> when `src`
 * is supplied (drop a file in /public and pass its path from VideoSection),
 * otherwise animates the procedural CinemaLoop canvas. Either way it pauses
 * when off screen or the tab is hidden, so it never burns frames unseen.
 */
const CinemaScreen = ({ src, poster, animate, videoRef }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (src || !animate) return; // real video / static poster path
    const canvas = canvasRef.current;
    if (!canvas) return;
    let loop;
    let io;
    let disposed = false;

    import("./cinemaLoop.js").then(({ CinemaLoop }) => {
      if (disposed || !canvasRef.current) return;
      loop = new CinemaLoop(canvasRef.current);
      const onResize = () => loop.resize();
      window.addEventListener("resize", onResize, { passive: true });
      // only run while visible
      io = new IntersectionObserver(
        ([e]) => (e.isIntersecting ? loop.start() : loop.stop()),
        { threshold: 0.01 }
      );
      io.observe(canvasRef.current);
      loop._onResize = onResize;
    });

    return () => {
      disposed = true;
      io?.disconnect();
      if (loop) {
        window.removeEventListener("resize", loop._onResize);
        loop.dispose();
      }
    };
  }, [src, animate]);

  if (src) {
    // starts muted (required for autoplay); VideoSection toggles the audio
    // imperatively on the ref so it stays reliable across browsers
    return (
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
      />
    );
  }
  // reduced-motion: a still cinematic wash instead of the animated canvas
  if (!animate) {
    return (
      <div
        className="h-full w-full"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 40%, #0a2418 0%, #04120b 55%, #010805 100%)",
        }}
      />
    );
  }
  return <canvas ref={canvasRef} className="h-full w-full" />;
};

/**
 * VideoSection — the cinematic act after the Hero. A fullscreen video plays,
 * then, as the user keeps scrolling, it scales down and a physical TV forms
 * around it (rounded screen, bezel, depth, stand). Built on a sticky pin +
 * one scrubbed useScroll (useTvScroll) — the codebase's ScrollTrigger idiom —
 * so it's frame-perfect and releases scroll cleanly when the set is complete.
 *
 * Swap the placeholder for real footage by passing `src` (e.g. "/cinema.mp4").
 */
const VideoSection = ({ src = VIDEO_SRC, poster = null }) => {
  const { animationsOn } = useAnimationContext();
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);
  const m = useTvScroll(sectionRef);

  // Drive audio imperatively (React's `muted` prop is famously unreliable).
  // Unmuting happens inside the click handler's user-gesture, so it's allowed.
  const toggleSound = () => {
    const v = videoRef.current;
    const next = !muted;
    setMuted(next);
    if (v) {
      v.muted = next;
      if (!next) v.play?.().catch(() => {});
    }
  };

  // Reduced motion / effects off: a calm, static framed screen — no pin, no
  // heavy morph — so the content and its meaning survive.
  if (!animationsOn) {
    return (
      <section className="container-goa py-24">
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl border border-slate-line bg-black shadow-[var(--glass-panel-shadow)]">
            <div className="aspect-video">
              <CinemaScreen src={src} poster={poster} animate={false} />
            </div>
          </div>
          <p className="mt-6 text-center text-fog">
            One community, in motion — the GOA experience.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative h-[250vh]">
      {/* pinned stage */}
      <div
        className="sticky top-0 flex h-screen items-center justify-center overflow-hidden"
        style={{ perspective: 1400 }}
      >
        <TvFrame m={m}>
          <CinemaScreen src={src} poster={poster} animate videoRef={videoRef} />
        </TvFrame>

        {/* Sound toggle — top of the TV. Interactive island above the pinned
            stage; only meaningful when a real video is present. */}
        {src && (
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={!muted}
            aria-label={muted ? "Unmute video" : "Mute video"}
            className="glass hairline pointer-events-auto absolute top-24 z-20 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-snow shadow-[0_10px_40px_-20px_rgba(0,0,0,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:text-neon"
          >
            <Icon name={muted ? "VolumeX" : "Volume2"} className="size-4" />
            {muted ? "Sound off" : "Sound on"}
          </button>
        )}

        {/* intro line over the full-bleed cinema, gone before the morph */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-[12%] flex flex-col items-center gap-3 px-6 text-center"
          style={{ opacity: m.introOpacity }}
        >
          <span className="font-display text-xs font-semibold uppercase tracking-[0.4em] text-neon">
            Now playing
          </span>
          <h2
            className="max-w-3xl font-display text-3xl font-bold text-snow sm:text-5xl"
            style={{ textShadow: "var(--text-halo)" }}
          >
            One community, in motion
          </h2>
          <span className="mt-2 flex h-9 w-5 items-start justify-center rounded-full border border-white/30 p-1">
            <span
              className="size-1.5 rounded-full bg-neon"
              style={{ "--drift-y": "12px", animation: "goa-drift 1.6s ease-in-out infinite" }}
            />
          </span>
        </motion.div>
      </div>
    </section>
  );
};

export default VideoSection;
