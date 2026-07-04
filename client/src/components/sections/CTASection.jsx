import { motion } from "framer-motion";
import Section from "../layout/Section.jsx";
import Button from "../ui/Button.jsx";
import Badge from "../ui/Badge.jsx";
import Icon from "../ui/Icon.jsx";
import { LogoMark } from "../ui/Logo.jsx";
import { viewportOnce } from "../../utils/motion.js";

/** CTASection — closing call to action; reused across pages. */
const CTASection = ({
  eyebrow = "Ready when you are",
  title = "Start building the career you actually want",
  description = "Join the next cohort of Goal-Oriented Academy and turn your ambition into shipped, reviewed, hireable work.",
  primary = { label: "Apply now", to: "/contact" },
  secondary = { label: "Browse courses", to: "/courses" },
}) => (
  <Section id="cta">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportOnce}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-[2rem] border border-lime/15 bg-gradient-to-br from-graphite/80 to-carbon/90 px-6 py-16 text-center sm:px-16 sm:py-24"
    >
      {/* Ambience */}
      <div className="absolute inset-0 bg-grid bg-grid-fade opacity-30" />
      <div className="glow-orb left-1/2 top-1/2 size-[36rem] -translate-x-1/2 -translate-y-1/2 opacity-40" />

      <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
        <LogoMark size={56} className="animate-float drop-shadow-[0_0_24px_rgba(125,255,158,0.5)]" />
        <Badge tone="neon" pixel>{eyebrow}</Badge>
        <h2 className="h1 text-balance">{title}</h2>
        <p className="lead">{description}</p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
          <Button to={primary.to} size="lg" magnetic glow cursorLabel="Go">
            {primary.label}
            <Icon name="ArrowRight" className="size-4" />
          </Button>
          <Button to={secondary.to} size="lg" variant="secondary">
            {secondary.label}
          </Button>
        </div>
      </div>
    </motion.div>
  </Section>
);

export default CTASection;
