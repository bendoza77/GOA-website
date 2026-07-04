import { cn } from "../../utils/cn.js";

/**
 * GlowOrbs — soft, blurred radial lights that give sections depth.
 * Purely decorative; pointer-events-none and aria-hidden.
 */
const GlowOrbs = ({ className }) => (
  <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden="true">
    <div className="glow-orb animate-pulse-glow left-[-6rem] top-[-4rem] size-[26rem] opacity-40" />
    <div
      className="glow-orb animate-pulse-glow right-[-8rem] top-1/3 size-[30rem] opacity-30"
      style={{ animationDelay: "2s", background: "radial-gradient(circle, var(--glow-color-2), transparent 70%)" }}
    />
    <div
      className="glow-orb animate-pulse-glow bottom-[-6rem] left-1/4 size-[22rem] opacity-25"
      style={{ animationDelay: "4s" }}
    />
  </div>
);

export default GlowOrbs;
