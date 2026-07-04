import AnimatedCounter from "../ui/AnimatedCounter.jsx";
import { cn } from "../../utils/cn.js";

/** StatCard — big animated metric with label. Used in hero + impact bands. */
const StatCard = ({ value, suffix, decimals, label, className }) => (
  <div className={cn("group relative text-center sm:text-left", className)}>
    <div className="font-display text-4xl font-bold tracking-tight text-snow sm:text-5xl">
      <AnimatedCounter value={value} suffix={suffix} decimals={decimals} className="text-gradient-green" />
    </div>
    <p className="mt-1 text-sm text-fog">{label}</p>
  </div>
);

export default StatCard;
