import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { CUBE_VH } from "../worldTimeline.js";

/* Community photos for the six cube faces — bundled from src/assets/images at
   build time (glob keeps us decoupled from the exact filenames and sorts them
   deterministically so face order is stable). */
const FACE_IMAGES = Object.entries(
  import.meta.glob("../../assets/images/*.{png,jpg,jpeg,webp,avif}", {
    eager: true,
    import: "default",
  })
)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, url]) => url);

/**
 * CubeAct — act two of the prologue. The photo-faced hero cube falls into
 * the frame over the ride's held starfield, rotates through every one of
 * its six faces, then releases upward into the universe — and exactly as
 * it vanishes, the world's arrival chapter begins.
 *
 * Self-contained: renders its own scroll runway, a fixed pointer-through
 * canvas the CubeEngine draws into, and a DOM caption the engine fades in
 * while the cube holds centre stage. The engine chunk loads at idle and
 * everything disposes on unmount.
 */
const CubeAct = () => {
  const { t } = useTranslation();
  const canvasRef = useRef(null);
  const runwayRef = useRef(null);
  const captionRef = useRef(null);

  useEffect(() => {
    let engine = null;
    let disposed = false;
    let idleId;

    const boot = async () => {
      const { CubeEngine } = await import("./cubeEngine.js");
      if (disposed || !canvasRef.current || !runwayRef.current) return;
      engine = new CubeEngine(canvasRef.current, {
        isDark: true,
        coarse: window.matchMedia("(pointer: coarse)").matches,
        runwayEl: runwayRef.current,
        images: FACE_IMAGES,
        // Drive the readable caption straight on the DOM node — no React
        // re-render per frame; the engine only calls when the value moves.
        onCaption: (v) => {
          const el = captionRef.current;
          if (!el) return;
          el.style.opacity = String(v);
          el.style.transform = `translateY(${(1 - v) * 14}px)`;
        },
        // Show/hide the canvas as the act enters/leaves the frame, so a
        // preserved last frame can never linger over later chapters.
        onActive: (v) => {
          const el = canvasRef.current;
          if (el) el.style.opacity = v ? "1" : "0";
        },
      });
      engine.start();
    };

    if ("requestIdleCallback" in window) {
      idleId = requestIdleCallback(boot, { timeout: 900 });
    } else {
      idleId = setTimeout(boot, 400);
    }

    return () => {
      disposed = true;
      if ("requestIdleCallback" in window) cancelIdleCallback(idleId);
      else clearTimeout(idleId);
      engine?.dispose();
    };
  }, []);

  return (
    <>
      {/* Scroll runway — pure height between the ride and the world. The
          cube's release completes exactly as this scrolls out. */}
      <section
        ref={runwayRef}
        aria-hidden="true"
        className="relative"
        style={{ height: `${CUBE_VH}vh` }}
      />

      {/* Fixed WebGL stage — above the ride backdrop, below the HUD. */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ opacity: 0 }}
        className="pointer-events-none fixed inset-0 z-[3] h-full w-full opacity-0 transition-opacity duration-700"
      />

      {/* Caption — sits above the cube, centred; engine-driven fade. */}
      <p
        ref={captionRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-[8%] z-[4] mx-auto max-w-3xl px-6 text-center font-display text-xl font-bold leading-tight text-snow opacity-0 sm:text-3xl md:text-4xl"
        style={{ textShadow: "var(--text-halo)", willChange: "opacity, transform" }}
      >
        {t("world.cube.captionA")}{" "}
        <span className="text-gradient-green">{t("world.cube.captionB")}</span>
      </p>
    </>
  );
};

export default CubeAct;
