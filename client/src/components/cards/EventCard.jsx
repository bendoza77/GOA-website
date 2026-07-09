import { useTranslation } from "react-i18next";
import GlassPanel from "../ui/GlassPanel.jsx";
import Badge from "../ui/Badge.jsx";
import Icon from "../ui/Icon.jsx";
import Button from "../ui/Button.jsx";
import { accent } from "../../utils/accents.js";
import { cn } from "../../utils/cn.js";

/** EventCard — upcoming event with date block, mode + speaker. */
const EventCard = ({ event }) => {
  const { t } = useTranslation();
  const a = accent(event.accent);
  return (
    <GlassPanel hover tilt className="group flex h-full flex-col p-6 sm:flex-row sm:gap-6">
      {/* Date block */}
      <div className={cn("mb-4 flex shrink-0 flex-col items-center justify-center rounded-xl border p-4 sm:mb-0 sm:w-24", a.border, a.bg)}>
        <span className={cn("font-mono text-xs uppercase tracking-widest", a.text)}>{event.month}</span>
        <span className="font-display text-3xl font-bold text-snow">{event.day}</span>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge tone={event.accent === "neon" ? "neon" : "green"}>{event.type}</Badge>
          <span className="inline-flex items-center gap-1 font-mono text-xs text-fog"><Icon name="MapPin" className="size-3" /> {event.mode}</span>
        </div>
        <h3 className="h3 text-snow">{event.title}</h3>
        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-fog">{event.desc}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="inline-flex items-center gap-2 font-mono text-xs text-mist">
            <Icon name="Clock" className="size-3.5 text-lime" /> {event.time} · {event.speaker}
          </span>
          <Button size="sm" variant="neon" cursorLabel="RSVP">{t("common.reserve")}</Button>
        </div>
      </div>
    </GlassPanel>
  );
};

export default EventCard;
