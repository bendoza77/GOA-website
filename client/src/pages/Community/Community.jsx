import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import PageHeader from "../../components/sections/PageHeader.jsx";
import Section from "../../components/layout/Section.jsx";
import SectionTitle from "../../components/ui/SectionTitle.jsx";
import GlassPanel from "../../components/ui/GlassPanel.jsx";
import StatCard from "../../components/cards/StatCard.jsx";
import Icon from "../../components/ui/Icon.jsx";
import Marquee from "../../components/ui/Marquee.jsx";
import CTASection from "../../components/sections/CTASection.jsx";
import AmbientScene from "../../components/3d/ambient/AmbientScene.jsx";
import { useCommunityStats, useCommunityChannels, PARTNERS } from "../../data/community.js";
import { accent } from "../../utils/accents.js";
import { staggerContainer, scaleIn, depthIn, viewportOnce } from "../../utils/motion.js";
import { cn } from "../../utils/cn.js";

/** Community — the always-on network around the academy. */
const Community = () => {
  const { t } = useTranslation();
  const communityStats = useCommunityStats();
  const communityChannels = useCommunityChannels();
  return (
  <>
    {/* Page ambience — the member swarm orbiting as one halo */}
    <AmbientScene scene="community" />
    <PageHeader
      eyebrow={t("communityPage.header.eyebrow")}
      title={t("communityPage.header.title")}
      highlight={t("communityPage.header.highlight")}
      description={t("communityPage.header.description")}
    />

    <Section className="!pt-4">
      <motion.div
        variants={staggerContainer(0.1)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="grid gap-8 rounded-3xl border border-slate-line surface p-10 sm:grid-cols-2 lg:grid-cols-4"
      >
        {communityStats.map((s, i) => (
          <motion.div key={i} variants={scaleIn}>
            <StatCard {...s} className="text-center" />
          </motion.div>
        ))}
      </motion.div>
    </Section>

    <Section>
      <SectionTitle
        eyebrow={t("communityPage.section.eyebrow")}
        title={t("communityPage.section.title")}
        description={t("communityPage.section.description")}
      />
      <motion.div
        variants={staggerContainer(0.07)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {communityChannels.map((ch) => {
          const a = accent(ch.accent);
          return (
            <motion.div key={ch.name} variants={depthIn}>
              <GlassPanel hover tilt className="group h-full p-7">
                <div className={cn("mb-5 grid size-12 place-items-center rounded-xl border", a.border, a.bg, a.text)}>
                  <Icon name={ch.icon} className="size-6" strokeWidth={1.9} />
                </div>
                <h3 className="h3 mb-2 font-mono text-snow">{ch.name}</h3>
                <p className="text-sm leading-relaxed text-fog">{ch.desc}</p>
              </GlassPanel>
            </motion.div>
          );
        })}
      </motion.div>
    </Section>

    <Section>
      <p className="mb-8 text-center font-mono text-xs uppercase tracking-[0.3em] text-fog">
        {t("partners.trustedBy")}
      </p>
      <Marquee speed={40}>
        {PARTNERS.map((p) => (
          <span key={p} className="px-8 font-display text-2xl font-semibold text-mist/40 sm:text-3xl">
            {p}
          </span>
        ))}
      </Marquee>
    </Section>

    <CTASection variant="community" />
  </>
  );
};

export default Community;
