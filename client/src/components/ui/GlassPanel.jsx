import { cn } from "../../utils/cn.js";

/**
 * GlassPanel — frosted, layered surface used for cards and floating UI.
 * `hover` adds a lift + neon border on hover. `glow` adds an ambient halo.
 */
const GlassPanel = ({ children, className, hover = false, glow = false, as: Tag = "div", ...rest }) => (
  <Tag
    className={cn(
      "glass-panel relative",
      hover &&
        "transition-all duration-500 hover:-translate-y-1.5 hover:border-lime/30 hover:shadow-[0_30px_70px_-30px_rgba(0,0,0,0.9),0_0_50px_-24px_rgba(125,255,158,0.5)]",
      glow && "ring-neon",
      className
    )}
    {...rest}
  >
    {children}
  </Tag>
);

export default GlassPanel;
