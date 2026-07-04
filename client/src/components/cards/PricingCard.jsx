import GlassPanel from "../ui/GlassPanel.jsx";
import Button from "../ui/Button.jsx";
import Badge from "../ui/Badge.jsx";
import Icon from "../ui/Icon.jsx";
import { cn } from "../../utils/cn.js";

/** PricingCard — plan tile; `featured` gets the neon spotlight treatment. */
const PricingCard = ({ plan }) => (
  <GlassPanel
    hover
    className={cn(
      "group relative flex h-full flex-col p-8",
      plan.featured && "border-neon/30 ring-neon"
    )}
  >
    {plan.featured && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
        <Badge tone="neon" dot pixel>Most popular</Badge>
      </div>
    )}
    <h3 className="h3 text-snow">{plan.name}</h3>
    <p className="mt-1 text-sm text-fog">{plan.tagline}</p>

    <div className="my-6 flex items-end gap-1">
      <span className="font-display text-5xl font-bold text-snow">{plan.price}</span>
      {plan.period && <span className="mb-2 text-sm text-fog">/ {plan.period}</span>}
    </div>

    <ul className="mb-8 flex flex-1 flex-col gap-3">
      {plan.features.map((f) => (
        <li key={f} className="flex items-start gap-3 text-sm text-mist">
          <Icon name="CheckCircle2" className="mt-0.5 size-4 shrink-0 text-lime" />
          {f}
        </li>
      ))}
    </ul>

    <Button
      to="/contact"
      variant={plan.featured ? "primary" : "outline"}
      className="w-full"
      magnetic={plan.featured}
      cursorLabel="Join"
    >
      {plan.cta}
    </Button>
  </GlassPanel>
);

export default PricingCard;
