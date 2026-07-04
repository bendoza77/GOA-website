import { cn } from "../../utils/cn.js";

/**
 * Avatar — brand-gradient initials tile. Keeps the design asset-free while
 * staying consistent with the green identity. `accent` picks the gradient.
 */
const ACCENTS = {
  green: "from-forest to-green text-accent-ink",
  lime: "from-green to-lime text-accent-ink",
  neon: "from-lime to-neon text-accent-ink",
};

const SIZES = {
  sm: "size-9 text-xs",
  md: "size-12 text-sm",
  lg: "size-16 text-lg",
  xl: "size-20 text-2xl",
};

const Avatar = ({ initials, accent = "green", size = "md", ring = true, className }) => (
  <div
    className={cn(
      "grid place-items-center rounded-full bg-gradient-to-br font-display font-semibold shadow-lg",
      ACCENTS[accent],
      SIZES[size],
      ring && "ring-2 ring-white/10",
      className
    )}
    aria-hidden="true"
  >
    {initials}
  </div>
);

export default Avatar;
