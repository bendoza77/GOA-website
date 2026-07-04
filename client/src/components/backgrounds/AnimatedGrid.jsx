import { cn } from "../../utils/cn.js";

/**
 * AnimatedGrid — the matrix floor. A faded, slowly panning green grid that
 * echoes the logo's perspective grid. `perspective` tilts it into a 3D floor.
 */
const AnimatedGrid = ({ className, perspective = false, fade = true }) => (
  <div
    className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    aria-hidden="true"
  >
    <div
      className={cn(
        "absolute inset-0 bg-grid",
        fade && "bg-grid-fade",
        "[animation:goa-grid-pan_6s_linear_infinite]"
      )}
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
    />
  </div>
);

export default AnimatedGrid;
