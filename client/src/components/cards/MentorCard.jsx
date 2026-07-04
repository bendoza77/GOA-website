import GlassPanel from "../ui/GlassPanel.jsx";
import Avatar from "../ui/Avatar.jsx";
import Icon from "../ui/Icon.jsx";
import { accent } from "../../utils/accents.js";
import { cn } from "../../utils/cn.js";

/** MentorCard — profile tile with initials avatar, role + focus. */
const MentorCard = ({ mentor }) => {
  const a = accent(mentor.accent);
  return (
    <GlassPanel hover className="group flex h-full flex-col items-center p-7 text-center">
      <div className="relative mb-5">
        <div className={cn("absolute -inset-2 rounded-full opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-60", a.bg)} />
        <Avatar initials={mentor.initials} accent={mentor.accent} size="xl" className="relative transition-transform duration-500 group-hover:scale-105" />
      </div>

      <h3 className="h3 text-snow">{mentor.name}</h3>
      <p className={cn("mt-1 text-sm font-medium", a.text)}>{mentor.role}</p>
      <p className="mt-0.5 font-mono text-xs text-fog">@ {mentor.company}</p>

      <p className="mt-4 text-sm leading-relaxed text-fog">{mentor.bio}</p>

      <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-line surface-2 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-wider text-mist">
        <Icon name="Sparkles" className="size-3 text-lime" />
        {mentor.focus}
      </div>
    </GlassPanel>
  );
};

export default MentorCard;
