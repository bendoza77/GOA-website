import SplineScene from "./SplineScene.jsx";
import FloatingObjects from "./FloatingObjects.jsx";
import { cn } from "../../utils/cn.js";

/**
 * HeroRobot — the hero's interactive 3D focal point.
 *
 * Attempts to stream an interactive Spline scene; if a scene URL isn't
 * supplied (or fails to load / device can't handle it), it falls back to the
 * fully self-contained <FloatingObjects> ambience so the hero always shines.
 *
 * Pass a `scene` prop (a Spline .splinecode URL) to enable the live 3D model:
 *   <HeroRobot scene="https://prod.spline.design/xxxx/scene.splinecode" />
 */
const HeroRobot = ({ scene, className }) => (
  <div className={cn("relative h-full w-full", className)}>
    <SplineScene
      scene={scene}
      className="h-full w-full"
      fallback={<FloatingObjects />}
    />
  </div>
);

export default HeroRobot;
