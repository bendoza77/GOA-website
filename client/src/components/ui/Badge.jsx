import { cn } from "../../utils/cn.js";

/**
 * Badge — small pill/eyebrow. `dot` shows a pulsing status dot.
 * Variant `pixel` nods to the blocky logo mark.
 */
const TONES = {
  green: "border-green/30 text-lime bg-green/10",
  neon: "border-neon/30 text-neon bg-neon/10",
  ghost: "border-ash/60 text-fog surface-2",
};

const Badge = ({ children, tone = "green", dot = false, pixel = false, className }) => (
  <span
    className={cn(
      "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
      pixel ? "font-mono tracking-widest uppercase" : "font-mono tracking-wide",
      TONES[tone],
      className
    )}
  >
    {dot && (
      <span className="relative flex size-1.5">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-neon opacity-70" />
        <span className="relative inline-flex size-1.5 rounded-full bg-neon" />
      </span>
    )}
    {children}
  </span>
);

export default Badge;
