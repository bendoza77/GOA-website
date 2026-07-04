import { cn } from "../../utils/cn.js";
import AnimatedGrid from "./AnimatedGrid.jsx";
import GlowOrbs from "./GlowOrbs.jsx";

/**
 * PageBackground — the shared fixed backdrop behind every route:
 * theme-aware brand wash + faint matrix grid + ambient glow orbs + a
 * vignette. Sits at z -10 so all content layers above it. The wash colours
 * read from CSS variables so they invert cleanly between light and dark.
 */
const PageBackground = ({ className, grid = true, orbs = true }) => (
  <div className={cn("fixed inset-0 -z-10 overflow-hidden bg-void", className)} aria-hidden="true">
    {/* radial brand wash (theme-aware via --wash-* variables) */}
    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(ellipse 80% 50% at 50% -10%, var(--wash-top), transparent 60%)",
      }}
    />
    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(ellipse 60% 50% at 80% 110%, var(--wash-bottom), transparent 60%)",
      }}
    />
    {grid && <AnimatedGrid />}
    {orbs && <GlowOrbs />}
    {/* subtle vignette toward the page colour */}
    <div className="absolute inset-0 bg-gradient-to-b from-void/0 via-void/0 to-void/80" />
  </div>
);

export default PageBackground;
