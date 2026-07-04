import GlassPanel from "../ui/GlassPanel.jsx";
import Avatar from "../ui/Avatar.jsx";
import Icon from "../ui/Icon.jsx";
import { accent } from "../../utils/accents.js";
import { cn } from "../../utils/cn.js";

/** StoryCard — success story with before → after transformation + metrics. */
const StoryCard = ({ story }) => {
  const a = accent(story.accent);
  return (
    <GlassPanel hover className="group flex h-full flex-col p-7">
      <div className="mb-5 flex items-center gap-4">
        <Avatar initials={story.initials} accent={story.accent} size="lg" />
        <div>
          <h3 className="h3 text-snow">{story.name}</h3>
          <p className="font-mono text-xs text-fog">{story.track}</p>
        </div>
      </div>

      {/* before → after */}
      <div className="mb-5 flex items-center gap-3 text-sm">
        <span className="rounded-lg border border-slate-line surface px-3 py-1.5 text-fog line-through decoration-red-500/40">
          {story.before}
        </span>
        <Icon name="ArrowRight" className={cn("size-4 shrink-0", a.text)} />
        <span className={cn("rounded-lg border px-3 py-1.5 font-medium text-snow", a.border, a.bg)}>
          {story.after}
        </span>
      </div>

      <p className="mb-6 flex-1 text-sm leading-relaxed text-mist">“{story.quote}”</p>

      <div className="grid grid-cols-2 gap-3 border-t border-slate-line pt-5">
        <div>
          <div className="font-display text-2xl font-bold text-gradient-green">{story.salary}</div>
          <div className="text-xs text-fog">Salary change</div>
        </div>
        <div>
          <div className="font-display text-2xl font-bold text-snow">{story.months} mo</div>
          <div className="text-xs text-fog">To hired</div>
        </div>
      </div>
    </GlassPanel>
  );
};

export default StoryCard;
