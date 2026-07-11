import { useEffect, useRef, useState } from "react";
import { useAnimationContext } from "../../../context/AnimationContext.jsx";
import { cn } from "../../../utils/cn.js";

/**
 * AmbientScene — mounts a per-page 3D ambience (AmbientEngine + one scene
 * definition) on a fixed, pointer-transparent canvas layered between the
 * page backdrop and the content — the inner-page sibling of Home's
 * <ScrollJourney>.
 *
 * The engine and the page's scene chunk are imported during idle time after
 * the page is interactive, so they never compete with the initial load, and
 * the canvas cross-fades in once the scene is live (no pop-in).
 *
 * Honours prefers-reduced-motion via AnimationContext and follows the
 * data-theme attribute so colours flip with the theme toggle.
 */

/* Scene registry — each entry is its own code-split chunk. */
const SCENES = {
  about: () => import("./scenes/aboutScene.js"),
  services: () => import("./scenes/servicesScene.js"),
  courses: () => import("./scenes/coursesScene.js"),
  mentors: () => import("./scenes/mentorsScene.js"),
  community: () => import("./scenes/communityScene.js"),
  events: () => import("./scenes/eventsScene.js"),
  stories: () => import("./scenes/storiesScene.js"),
  blog: () => import("./scenes/blogScene.js"),
  contact: () => import("./scenes/contactScene.js"),
};

const AmbientScene = ({ scene, className }) => {
  const { animationsOn } = useAnimationContext();
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const load = SCENES[scene];
    if (!animationsOn || !load) return;
    let engine = null;
    let disposed = false;
    let idleId;

    const boot = async () => {
      const [{ AmbientEngine }, { default: def }] = await Promise.all([
        import("./ambientEngine.js"),
        load(),
      ]);
      if (disposed || !canvasRef.current) return;
      engine = new AmbientEngine(canvasRef.current, def, {
        isDark: document.documentElement.dataset.theme !== "light",
        coarse: window.matchMedia("(pointer: coarse)").matches,
      });
      engine.start();
      setReady(true);
    };

    if ("requestIdleCallback" in window) {
      idleId = requestIdleCallback(boot, { timeout: 2000 });
    } else {
      idleId = setTimeout(boot, 700);
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
      setReady(false);
    };
  }, [animationsOn, scene]);

  if (!animationsOn) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed inset-0 -z-[5] h-full w-full transition-opacity duration-1000",
        ready ? "opacity-100" : "opacity-0",
        className
      )}
    />
  );
};

export default AmbientScene;
