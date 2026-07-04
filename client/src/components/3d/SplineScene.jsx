import { Component, lazy, Suspense, useState } from "react";
import { cn } from "../../utils/cn.js";
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

  // No scene provided → render the graceful visual fallback directly.
  if (!scene) {
    return <div className={cn("relative", className)}>{fallback}</div>;
  }

  const handleLoad = (app) => {
    setLoaded(true);
    onLoad?.(app);
  };

  return (
    <div className={cn("relative", className)}>
      <SplineErrorBoundary fallback={fallback}>
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
      </SplineErrorBoundary>
    </div>
  );
};

export default SplineScene;
