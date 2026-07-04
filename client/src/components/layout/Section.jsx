import { cn } from "../../utils/cn.js";

/**
 * Section — consistent vertical rhythm + centered container.
 * `id` enables anchor scrolling; `bleading` toggles the top padding.
 */
const Section = ({ id, children, className, containerClassName, as: Tag = "section" }) => (
  <Tag id={id} className={cn("section", className)}>
    <div className={cn("container-goa", containerClassName)}>{children}</div>
  </Tag>
);

export default Section;
