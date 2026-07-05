import { cn } from "../../utils/cn.js";

/**
 * AnimatedGrid — the matrix floor. A faded, slowly panning green grid that
 * echoes the logo's perspective grid. `perspective` tilts it into a 3D floor.
 *
 * The grid pattern lives on an inner layer oversized by one tile (48px) and
 * pans with a transform, so the animation runs entirely on the compositor —
 * no per-frame repaints. Masks/perspective sit on the wrapper so they don't
 * fight the panning transform.
 */
const AnimatedGrid = ({ className, perspective = false, fade = true }) => (
  <div
    className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    aria-hidden="true"
  >
    <div
      className={cn("absolute inset-0 overflow-hidden", fade && "bg-grid-fade")}
      style={
        perspective
          ? {
              transform: "perspective(500px) rotateX(60deg) scale(2)",
              transformOrigin: "center bottom",
              maskImage: "linear-gradient(to bottom, transparent, #000 60%, transparent)",
              WebkitMaskImage: "linear-gradient(to bottom, transparent, #000 60%, transparent)",
            }
          : undefined
      }
    >
      <div className="absolute inset-x-0 -top-12 bottom-0 bg-grid [animation:goa-grid-pan_6s_linear_infinite]" />
    </div>
  </div>
);

export default AnimatedGrid;
