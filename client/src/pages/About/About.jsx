import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import PageHeader from "../../components/sections/PageHeader.jsx";
import Section from "../../components/layout/Section.jsx";
import SectionTitle from "../../components/ui/SectionTitle.jsx";
import GlassPanel from "../../components/ui/GlassPanel.jsx";
import Reveal from "../../components/ui/Reveal.jsx";
import Icon from "../../components/ui/Icon.jsx";
import Timeline from "../../components/ui/Timeline.jsx";
import FloatingObjects from "../../components/3d/FloatingObjects.jsx";
import AmbientScene from "../../components/3d/ambient/AmbientScene.jsx";
import ImpactStats from "../../components/sections/ImpactStats.jsx";
import CTASection from "../../components/sections/CTASection.jsx";
import { useValues, useJourney } from "../../data/journey.js";
import {
  staggerContainer,
  depthIn,
  slideInLeft,
  slideInRight,
  viewportOnce,
} from "../../utils/motion.js";

/** About — mission, values, journey and impact. */
const About = () => {
  const { t } = useTranslation();
  const values = useValues();
  const journey = useJourney();
  const missionPoints = t("about.mission.points", { returnObjects: true });
  return (
  <>
    {/* Page ambience — holographic globe drifting behind the story */}
    <AmbientScene scene="about" />
    <PageHeader
      eyebrow={t("about.header.eyebrow")}
      title={t("about.header.title")}
      highlight={t("about.header.highlight")}
      description={t("about.header.description")}
    />

    {/* Mission split */}
    <Section className="!pt-6">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal variants={slideInLeft}>
          <span className="eyebrow">{t("about.mission.eyebrow")}</span>
          <h2 className="h2 mt-4 text-balance">
            {t("about.mission.title")}
          </h2>
          <p className="lead mt-5">
            {t("about.mission.lead")}
          </p>
          <ul className="mt-6 flex flex-col gap-3">
            {missionPoints.map((point) => (
              <li key={point} className="flex items-center gap-3 text-mist">
                <Icon name="CheckCircle2" className="size-5 shrink-0 text-lime" />
                {point}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1} variants={slideInRight}>
          <GlassPanel className="relative h-[380px] overflow-hidden">
            <FloatingObjects />
          </GlassPanel>
        </Reveal>
      </div>
    </Section>

    {/* Values */}
    <Section>
      <SectionTitle
        eyebrow={t("about.values.eyebrow")}
        title={t("about.values.title")}
      />
      <motion.div
        variants={staggerContainer(0.08)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {values.map((v, i) => (
          <motion.div key={i} variants={depthIn}>
            <GlassPanel hover tilt className="h-full p-7">
              <div className="mb-5 grid size-12 place-items-center rounded-xl border border-lime/20 bg-green/10 text-lime">
                <Icon name={v.icon} className="size-6" strokeWidth={1.9} />
              </div>
              <h3 className="h3 mb-2 text-snow">{v.title}</h3>
              <p className="text-sm leading-relaxed text-fog">{v.desc}</p>
            </GlassPanel>
          </motion.div>
        ))}
      </motion.div>
    </Section>

    {/* Journey */}
    <Section>
      <SectionTitle
        eyebrow={t("about.journey.eyebrow")}
        title={t("about.journey.title")}
        description={t("about.journey.description")}
      />
      <div className="mt-16">
        <Timeline steps={journey} />
      </div>
    </Section>

    <ImpactStats />
    <CTASection />
  </>
  );
};

export default About;
