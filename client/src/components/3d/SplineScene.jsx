import { Component, lazy, Suspense, useEffect, useRef, useState } from "react";
import { cn } from "../../utils/cn.js";
import { useNearViewport } from "../../hooks/useNearViewport.js";
import SceneLoader from "./SceneLoader.jsx";

/* Lazy-load the (heavy) Spline runtime only when a scene is actually used. */
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
 * The multi-MB Spline runtime is fetched only once the scene container
 * approaches the viewport (useNearViewport), so it never competes with the
 * initial page load. Until then only the lightweight loader renders.
 *
 * Props:
 *  - scene:     Spline .splinecode URL (optional). Omit to render `fallback`.
 *  - className: sizing wrapper classes.
 *  - loading:   custom loader node (defaults to <SceneLoader/>).
 *  - fallback:  node rendered if 3D can't load (defaults to `fallback` prop).
 *  - onLoad:    callback when the scene finishes loading.
 *
 * JavaScript only — no TypeScript, per project standard.
 */
const SplineScene = ({ scene, className, loading, fallback = null, onLoad, ...rest }) => {
  const [loaded, setLoaded] = useState(false);
  const [containerRef, near] = useNearViewport();
  const appRef = useRef(null);

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

  // No scene provided → render the graceful visual fallback directly.
  if (!scene) {
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
        {near ? (
          <Suspense fallback={loading ?? <SceneLoader />}>
            {!loaded && (loading ?? <SceneLoader />)}
            <Spline
              scene={scene}
              onLoad={handleLoad}
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
