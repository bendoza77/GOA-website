import { cn } from "../../utils/cn.js";
import Reveal from "./Reveal.jsx";

/**
 * SectionTitle — consistent eyebrow + heading + description block.
 * `align` centres or left-aligns; `as` sets the heading level for a11y.
 */
const SectionTitle = ({
  eyebrow,
  title,
  description,
  align = "center",
  as: Heading = "h2",
  className,
  titleClassName,
}) => (
  <div
    className={cn(
      "flex flex-col gap-4",
      align === "center" ? "items-center text-center mx-auto max-w-2xl" : "items-start text-left max-w-2xl",
      className
    )}
  >
    {eyebrow && (
      <Reveal>
        <span className="eyebrow inline-flex items-center gap-2">
          <span className="inline-block h-px w-6 bg-lime/60" />
          {eyebrow}
        </span>
      </Reveal>
    )}
    <Reveal delay={0.05}>
      <Heading className={cn("h2 text-balance", titleClassName)}>{title}</Heading>
    </Reveal>
    {description && (
      <Reveal delay={0.1}>
        <p className={cn("lead text-pretty", align === "center" && "mx-auto")}>{description}</p>
      </Reveal>
    )}
  </div>
);

export default SectionTitle;
