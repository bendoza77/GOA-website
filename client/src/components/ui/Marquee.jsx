import { cn } from "../../utils/cn.js";

/**
 * Marquee — infinite horizontal scroller (CSS-driven, pauses on hover).
 * Duplicates children so the loop is seamless. `reverse` flips direction.
 */
const Marquee = ({ children, className, speed = 32, reverse = false, pauseOnHover = true }) => (
  <div className={cn("group/marquee relative flex overflow-hidden mask-fade-x", className)}>
    <div
      className={cn(
        "flex shrink-0 items-center gap-6 pr-6 animate-marquee",
        pauseOnHover && "group-hover/marquee:[animation-play-state:paused]"
      )}
      style={{ animationDuration: `${speed}s`, animationDirection: reverse ? "reverse" : "normal" }}
    >
      {children}
    </div>
    <div
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center gap-6 pr-6 animate-marquee",
        pauseOnHover && "group-hover/marquee:[animation-play-state:paused]"
      )}
      style={{ animationDuration: `${speed}s`, animationDirection: reverse ? "reverse" : "normal" }}
    >
      {children}
    </div>
  </div>
);

export default Marquee;
