import { Link } from "react-router-dom";
import GlassPanel from "../ui/GlassPanel.jsx";
import Icon from "../ui/Icon.jsx";
import Badge from "../ui/Badge.jsx";
import { accent } from "../../utils/accents.js";
import { cn } from "../../utils/cn.js";

/** CourseCard — catalogue tile with stack chips, meta + CTA. */
const CourseCard = ({ course }) => {
  const a = accent(course.accent);
  return (
    <GlassPanel hover tilt className={cn("group flex h-full flex-col p-6", a.glow)}>
      <div className="mb-5 flex items-start justify-between">
        <div
          className={cn(
            "grid size-12 place-items-center rounded-xl border bg-gradient-to-br text-accent-ink transition-transform duration-500 group-hover:scale-110",
            a.border,
            a.gradient
          )}
        >
          <Icon name={course.icon} className="size-6" strokeWidth={2} />
        </div>
        {course.tag && <Badge tone={course.accent === "neon" ? "neon" : "green"}>{course.tag}</Badge>}
      </div>

      <h3 className="h3 mb-2 text-snow transition-colors group-hover:text-lime">{course.title}</h3>
      <p className="mb-4 flex-1 text-sm leading-relaxed text-fog">{course.blurb}</p>

      <div className="mb-5 flex flex-wrap gap-1.5">
        {course.stack.map((s) => (
          <span
            key={s}
            className="rounded-md border border-ash/60 surface-2 px-2 py-0.5 font-mono text-[0.65rem] text-mist"
          >
            {s}
          </span>
        ))}
      </div>

      <div className="mb-5 flex items-center gap-4 font-mono text-xs text-fog">
        <span className="inline-flex items-center gap-1.5"><Icon name="Clock" className="size-3.5" /> {course.duration}</span>
        <span className="inline-flex items-center gap-1.5"><Icon name="BookOpen" className="size-3.5" /> {course.lessons} lessons</span>
      </div>

      <div className="flex items-center justify-between border-t border-slate-line pt-4">
        <div>
          <span className="font-display text-xl font-bold text-snow">{course.price}</span>
          <span className="ml-1 text-xs text-fog">/ track</span>
        </div>
        <Link
          to="/courses"
          className={cn(
            "inline-flex items-center gap-1 text-sm font-medium transition-all",
            a.text
          )}
        >
          Explore
          <Icon name="ArrowRight" className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </GlassPanel>
  );
};

export default CourseCard;
