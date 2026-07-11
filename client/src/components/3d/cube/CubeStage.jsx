import { useEffect, useRef } from "react";
import { useAnimationContext } from "../../../context/AnimationContext.jsx";
import { useIsDesktop } from "../../../hooks/useIsDesktop.js";

/* Community photos for the six cube faces — bundled from src/assets/images at
   build time (glob keeps us decoupled from the exact filenames and sorts them
   deterministically so face order is stable). */
const FACE_IMAGES = Object.entries(
  import.meta.glob("../../../assets/images/*.{png,jpg,jpeg,webp,avif}", {
    eager: true,
    import: "default",
  })
)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, url]) => url);

/**
 * CubeStage — the hero cube act, act two of Home (after the scroll-journey
 * ride). Self-contained: it renders its OWN scroll runway (the tall spacer
 * that gives the fall → reveal → travel sequence its timeline) plus a fixed,
 * pointer-through canvas the CubeEngine draws into, and a readable DOM caption
 * that the engine fades in while the front message faces the camera.
 *
 * The engine chunk (three.js + env-map) is imported at idle so it never
 * competes with the initial load, and the canvas cross-fades in once live.
 * Docks pixel-accurately into the Hero's reserved right-hand slot
 * (id="hero-cube-slot"). Self-gates on AnimationContext, follows the
 * data-theme attribute, and disposes every GPU resource on unmount.
 */
const CubeStage = ({ dockId = "hero-cube-slot", docked = false }) => {
  const { animationsOn } = useAnimationContext();
  // Cube is a desktop-only act — cancelled on phones and tablets (no dock slot
  // exists there, and the sequence is heavy for touch devices).
  const isDesktop = useIsDesktop();
  const canvasRef = useRef(null);
  const runwayRef = useRef(null);
  const captionRef = useRef(null);

  useEffect(() => {
    if (!animationsOn || !isDesktop) return;
    let engine = null;
    let disposed = false;
    let idleId;

    const boot = async () => {
      const { CubeEngine } = await import("./cubeEngine.js");
      // Docked mode has no runway of its own; only the ride needs one.
      if (disposed || !canvasRef.current || (!docked && !runwayRef.current))
        return;
      engine = new CubeEngine(canvasRef.current, {
        isDark: document.documentElement.dataset.theme !== "light",
        coarse: window.matchMedia("(pointer: coarse)").matches,
        docked,
        runwayEl: runwayRef.current,
        dockEl: document.getElementById(dockId),
        images: FACE_IMAGES,
        // Drive the readable caption straight on the DOM node — no React
        // re-render per frame; the engine only calls when the value moves.
        onCaption: (v) => {
          const el = captionRef.current;
          if (!el) return;
          el.style.opacity = String(v);
          // lift + settle as it fades in, so the message feels placed
          // (translateY only — horizontal centring is handled by inset-x-0 +
          // mx-auto, robust to transformed ancestors)
          el.style.transform = `translateY(${(1 - v) * 14}px)`;
        },
        // Show/hide the canvas as the act enters/leaves the frame, so a
        // preserved last frame can never linger over later sections.
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

    const themeObserver = new MutationObserver(() => {
      engine?.setTheme(document.documentElement.dataset.theme !== "light");
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      disposed = true;
      if ("requestIdleCallback" in window) cancelIdleCallback(idleId);
      else clearTimeout(idleId);
      themeObserver.disconnect();
      engine?.dispose();
    };
  }, [animationsOn, isDesktop, dockId, docked]);

  if (!animationsOn || !isDesktop) return null;

  return (
    <>
      {/* Scroll runway — pure height, gives the cube act its timeline. Sits
          between the journey ride and the Hero; the cube docks as this ends.
          Skipped in docked mode (return visits), where the cube is placed in
          the hero from the first frame with no runway to scroll through. */}
      {!docked && (
        <section ref={runwayRef} aria-hidden="true" className="relative h-[300vh]" />
      )}

      {/* Fixed WebGL stage — above the journey backdrop, below the navbar. */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ opacity: 0 }}
        className="pointer-events-none fixed inset-0 z-[35] h-full w-full opacity-0 transition-opacity duration-700"
      />

      {/* Hero title — sits ABOVE the cube, centred. Fades in as the cube drops
          in and stays readable through the whole face reveal (engine-driven,
          compositor-only). */}
      <p
        ref={captionRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-[8%] z-[36] mx-auto max-w-3xl px-6 text-center font-display text-xl font-bold leading-tight text-snow opacity-0 sm:text-3xl md:text-4xl"
        style={{ textShadow: "var(--text-halo)", willChange: "opacity, transform" }}
      >
        A place where everyone is{" "}
        <span className="text-gradient-green">each other's friend</span>
      </p>
    </>
  );
};

export default CubeStage;
