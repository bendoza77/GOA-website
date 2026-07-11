import GlassPanel from "../ui/GlassPanel.jsx";
import Icon from "../ui/Icon.jsx";
import Badge from "../ui/Badge.jsx";
import { accent as accentOf } from "../../utils/accents.js";
import { cn } from "../../utils/cn.js";

/**
 * ServiceCard — premium offering tile. Cursor-following spotlight, a 3D tilt
 * toward the pointer (fine pointers only), an accent icon plaque that lifts on
 * hover, and a checklist of what's included. Accent (green/lime/neon) is
 * data-driven via utils/accents.
 */
const ServiceCard = ({ service, index }) => {
  const a = accentOf(service.accent);

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <GlassPanel
      hover
      tilt
      onMouseMove={onMove}
      className={cn("group flex h-full flex-col overflow-hidden p-7", a.glow)}
    >
      {/* cursor spotlight */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(260px circle at var(--mx) var(--my), rgba(125,255,158,0.1), transparent 65%)",
        }}
      />

      {/* watermark index — big, faint, nods to the process rail */}
      <span className="pointer-events-none absolute -right-1 top-3 select-none font-display text-6xl font-bold leading-none text-mist/[0.06]">
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="relative flex flex-1 flex-col">
        <div className="mb-5 flex items-center justify-between">
          <div
            className={cn(
              "grid size-12 place-items-center rounded-xl border transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3",
              a.bg,
              a.border,
              a.text
            )}
          >
            <Icon name={service.icon} className="size-6" strokeWidth={1.9} />
          </div>
          {service.tag && (
            <Badge tone={service.accent === "green" ? "green" : "neon"} className="shrink-0">
              {service.tag}
            </Badge>
          )}
        </div>

        <h3 className="h3 mb-2 text-snow">{service.title}</h3>
        <p className="mb-6 text-sm leading-relaxed text-fog">{service.blurb}</p>

        {Array.isArray(service.features) && (
          <ul className="mt-auto grid gap-2.5">
            {service.features.map((feat) => (
              <li key={feat} className="flex items-center gap-2.5 text-sm text-mist">
                <Icon name="Check" className={cn("size-4 shrink-0", a.text)} strokeWidth={2.5} />
                {feat}
              </li>
            ))}
          </ul>
        )}
      </div>
    </GlassPanel>
  );
};

export default ServiceCard;
