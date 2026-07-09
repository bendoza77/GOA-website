import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import Section from "../layout/Section.jsx";
import Button from "../ui/Button.jsx";
import Badge from "../ui/Badge.jsx";
import Icon from "../ui/Icon.jsx";
import { LogoMark } from "../ui/Logo.jsx";
import { viewportOnce } from "../../utils/motion.js";

/**
 * CTASection — closing call to action; reused across pages. Copy is selected
 * by `variant` (keys under `cta.*` in the locale files); the button routes per
 * variant are fixed here. Variants without their own primary/secondary label
 * fall back to the default ones.
 */
const CTA_ROUTES = {
  default: { primary: "/contact", secondary: "/courses" },
  community: { primary: "/contact", secondary: "/events" },
  events: { primary: "/contact", secondary: "/courses" },
  mentors: { primary: "/contact", secondary: "/community" },
  stories: { primary: "/contact", secondary: "/courses" },
};

const CTASection = ({ variant = "default" }) => {
  const { t } = useTranslation();
  const routes = CTA_ROUTES[variant] || CTA_ROUTES.default;

  const primaryLabel = t(`cta.${variant}.primary`, { defaultValue: t("cta.default.primary") });
  const secondaryLabel = t(`cta.${variant}.secondary`, { defaultValue: t("cta.default.secondary") });

  return (
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
          <Badge tone="neon" pixel>{t(`cta.${variant}.eyebrow`)}</Badge>
          <h2 className="h1 text-balance">{t(`cta.${variant}.title`)}</h2>
          <p className="lead">{t(`cta.${variant}.description`)}</p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
            <Button to={routes.primary} size="lg" magnetic glow cursorLabel="Go">
              {primaryLabel}
              <Icon name="ArrowRight" className="size-4" />
            </Button>
            <Button to={routes.secondary} size="lg" variant="secondary">
              {secondaryLabel}
            </Button>
          </div>
        </div>
      </motion.div>
    </Section>
  );
};

export default CTASection;
