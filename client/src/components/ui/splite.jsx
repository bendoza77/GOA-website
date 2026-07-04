import { Component, Suspense, lazy } from "react";
import SceneLoader from "../3d/SceneLoader.jsx";

/**
 * SplineScene — lazy-loaded Spline runtime wrapper (JavaScript version of the
 * shadcn/spline `splite` component). The heavy runtime is only fetched when
 * this renders. A small error boundary keeps a failed load (offline / blocked)
 * from crashing the tree — it renders the optional `fallback` instead.
 *
 * Props:
 *  - scene:     .splinecode URL
 *  - className: sizing classes for the canvas
 *  - fallback:  node shown if the 3D fails to load (optional)
 */
const Spline = lazy(() => import("@splinetool/react-spline"));

class SplineBoundary extends Component {
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

export function SplineScene({ scene, className, fallback = null }) {
  return (
    <SplineBoundary fallback={fallback}>
      <Suspense
        fallback={
          <div className="relative flex h-full w-full items-center justify-center">
            <SceneLoader />
          </div>
        }
      >
        <Spline scene={scene} className={className} />
      </Suspense>
    </SplineBoundary>
  );
}

export default SplineScene;
