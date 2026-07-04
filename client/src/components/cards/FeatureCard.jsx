import GlassPanel from "../ui/GlassPanel.jsx";
import Icon from "../ui/Icon.jsx";
import { cn } from "../../utils/cn.js";

/**
 * FeatureCard — icon + title + copy tile with a spotlight that follows the
 * cursor for a premium, tactile hover.
 */
const FeatureCard = ({ icon, title, desc, className }) => {
  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <GlassPanel
      hover
      onMouseMove={onMove}
      className={cn("group h-full overflow-hidden p-7", className)}
    >
      {/* cursor spotlight */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(240px circle at var(--mx) var(--my), rgba(125,255,158,0.1), transparent 65%)",
        }}
      />
      <div className="relative">
        <div className="mb-5 grid size-12 place-items-center rounded-xl border border-lime/20 bg-green/10 text-lime transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
          <Icon name={icon} className="size-6" strokeWidth={1.9} />
        </div>
        <h3 className="h3 mb-2 text-snow">{title}</h3>
        <p className="text-sm leading-relaxed text-fog">{desc}</p>
      </div>
    </GlassPanel>
  );
};

export default FeatureCard;
