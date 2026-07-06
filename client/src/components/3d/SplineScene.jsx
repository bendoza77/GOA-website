import { Component, lazy, Suspense, useEffect, useRef, useState } from "react";
import { cn } from "../../utils/cn.js";
import { useNearViewport } from "../../hooks/useNearViewport.js";
import { isLowEndDevice } from "../../utils/splineWarmup.js";
import SceneLoader from "./SceneLoader.jsx";

/* Lazy-load the (heavy) Spline runtime only when a scene is actually used.
   Shares the module cache with warmSplineScene(), so a warmed page resolves
   this instantly with the parse cost already paid during idle time. */
const Spline = lazy(() => import("@splinetool/react-spline"));

/**
 * SplineErrorBoundary — if the runtime or a scene fails to load (offline,
 * blocked, bad URL), we silently swap in the provided CSS fallback so the
 * page never shows a broken 3D canvas.
 */
class SplineErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) return this.props.fallback ?? null;
    return this.props.children;
  }
}

/**
 * SplineScene — reusable, lazy-loaded 3D scene wrapper.
 *
 * Loading is staged to keep scene construction (the one cost warmup can't
 * pay in advance: scene graph build + shader compile) off the scroll path:
 *
 *  1. nothing heavy renders until the container is within ~1600px of the
 *     viewport (≈1.5 screens — early enough to finish before it's visible);
 *  2. once near, the actual mount waits for a scroll lull (idle callback,
 *     short timeout) instead of landing mid-scroll-frame;
 *  3. low-end / data-saver devices skip the multi-MB runtime entirely and
 *     render the CSS `fallback` — same visual language, none of the cost.
 *
 * After load, an IntersectionObserver pauses the whole Spline app whenever
 * the scene is off-screen (its initial callback also stops scenes that
 * finish loading before being scrolled to), so the robot never taxes the
 * rest of the page.
 *
 * Props:
 *  - scene:     Spline .splinecode URL (optional). Omit to render `fallback`.
 *  - className: sizing wrapper classes.
 *  - loading:   custom loader node (defaults to <SceneLoader/>).
 *  - fallback:  node rendered if 3D can't/shouldn't load.
 *  - onLoad:    callback when the scene finishes loading.
 *
 * JavaScript only — no TypeScript, per project standard.
 */
const SplineScene = ({ scene, className, loading, fallback = null, onLoad, ...rest }) => {
  const [loaded, setLoaded] = useState(false);
  const [engaged, setEngaged] = useState(false); // near + idle → safe to mount
  const [containerRef, near] = useNearViewport({ margin: "1600px" });
  const appRef = useRef(null);

  /* Stage 2: once near, wait for a lull in main-thread work before mounting
     the runtime so scene build + shader compile never land mid-scroll. */
  useEffect(() => {
    if (!near || engaged) return;
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(() => setEngaged(true), { timeout: 900 });
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(() => setEngaged(true), 200);
    return () => clearTimeout(id);
  }, [near, engaged]);

  /* The Spline runtime keeps rendering (and re-rendering on every mousemove,
     since scenes track the pointer) even when scrolled out of sight, which
     drags down cursor/scroll performance page-wide. Pause the whole app the
     moment the scene leaves the viewport and resume when it returns. */
  useEffect(() => {
    const el = containerRef.current;
    if (!loaded || !el) return;
    const io = new IntersectionObserver(([entry]) => {
      const app = appRef.current;
      if (!app) return;
      try {
        if (entry.isIntersecting) app.play();
        else app.stop();
      } catch {
        /* runtime may already be disposed mid-navigation — nothing to pause */
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [loaded, containerRef]);

  // No scene, or a device that shouldn't pay for one → graceful fallback.
  if (!scene || isLowEndDevice()) {
    return <div className={cn("relative", className)}>{fallback}</div>;
  }

  const handleLoad = (app) => {
    appRef.current = app;
    setLoaded(true);
    onLoad?.(app);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <SplineErrorBoundary fallback={fallback}>
        {engaged ? (
          <Suspense fallback={loading ?? <SceneLoader />}>
            {!loaded && (loading ?? <SceneLoader />)}
            <Spline
              scene={scene}
              onLoad={handleLoad}
              renderOnDemand
              className={cn(
                "!h-full !w-full transition-opacity duration-700",
                loaded ? "opacity-100" : "opacity-0"
              )}
              {...rest}
            />
          </Suspense>
        ) : (
          loading ?? <SceneLoader />
        )}
      </SplineErrorBoundary>
    </div>
  );
};

export default SplineScene;
export { SplineScene };
