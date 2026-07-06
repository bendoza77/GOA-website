import { cn } from "../../utils/cn.js";
import { useTilt } from "../../hooks/useTilt.js";

/**
 * GlassPanel — frosted, layered surface used for cards and floating UI.
 * `hover` adds a lift + neon border on hover. `glow` adds an ambient halo.
 * `tilt` makes the panel lean toward the cursor in 3D (fine pointers only);
 * it takes over the hover lift so the two transforms never fight.
 */
const GlassPanel = ({
  children,
  className,
  hover = false,
  glow = false,
  tilt = false,
  as: Tag = "div",
  ...rest
}) => {
  const tiltRef = useTilt({ disabled: !tilt });

  return (
    <Tag
      ref={tilt ? tiltRef : undefined}
      className={cn(
        "glass-panel relative",
        hover &&
          "transition-all duration-500 hover:border-lime/30 hover:shadow-[0_30px_70px_-30px_rgba(0,0,0,0.9),0_0_50px_-24px_rgba(125,255,158,0.5)]",
        hover && !tilt && "hover:-translate-y-1.5",
        tilt && "will-change-transform",
        glow && "ring-neon",
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default GlassPanel;
