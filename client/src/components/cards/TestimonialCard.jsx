import GlassPanel from "../ui/GlassPanel.jsx";
import Avatar from "../ui/Avatar.jsx";
import Icon from "../ui/Icon.jsx";
import { cn } from "../../utils/cn.js";

/** TestimonialCard — quote tile used in the marquee + stories grid. */
const TestimonialCard = ({ item, className }) => (
  <GlassPanel className={cn("flex h-full w-[340px] shrink-0 flex-col p-6 sm:w-[400px]", className)}>
    <Icon name="Quote" className="mb-4 size-7 text-lime/50" />
    <p className="flex-1 text-[0.95rem] leading-relaxed text-mist">“{item.quote}”</p>
    <div className="mt-6 flex items-center gap-3 border-t border-slate-line pt-4">
      <Avatar initials={item.initials} accent={item.accent} size="sm" />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-snow">{item.name}</p>
        <p className="truncate font-mono text-xs text-fog">{item.role}</p>
      </div>
    </div>
  </GlassPanel>
);

export default TestimonialCard;
