import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import PageHeader from "../../components/sections/PageHeader.jsx";
import Section from "../../components/layout/Section.jsx";
import StoryCard from "../../components/cards/StoryCard.jsx";
import StatCard from "../../components/cards/StatCard.jsx";
import CTASection from "../../components/sections/CTASection.jsx";
import AmbientScene from "../../components/3d/ambient/AmbientScene.jsx";
import { useSuccessStories } from "../../data/successStories.js";
import { useHeroStats } from "../../data/stats.js";
import {
  staggerContainer,
  scaleIn,
  slideInLeft,
  slideInRight,
  viewportOnce,
} from "../../utils/motion.js";

/** SuccessStories — outcome-focused transformations + proof metrics. */
const SuccessStories = () => {
  const { t } = useTranslation();
  const stories = useSuccessStories();
  const heroStats = useHeroStats();
  return (
  <>
    {/* Page ambience — the career trajectory climbing with the scroll */}
    <AmbientScene scene="stories" />
    <PageHeader
      eyebrow={t("storiesPage.header.eyebrow")}
      title={t("storiesPage.header.title")}
      highlight={t("storiesPage.header.highlight")}
      description={t("storiesPage.header.description")}
    />

    <Section className="!pt-4">
      <motion.div
        variants={staggerContainer(0.1)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="grid gap-8 rounded-3xl border border-slate-line surface p-10 sm:grid-cols-2 lg:grid-cols-4"
      >
        {heroStats.map((s) => (
          <motion.div key={s.label} variants={scaleIn}>
            <StatCard {...s} className="text-center" />
          </motion.div>
        ))}
      </motion.div>
    </Section>

    <Section className="!pt-4">
      <motion.div
        variants={staggerContainer(0.08)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="grid gap-6 lg:grid-cols-2"
      >
        {stories.map((story, i) => (
          <motion.div key={story.id} variants={i % 2 ? slideInRight : slideInLeft}>
            <StoryCard story={story} />
          </motion.div>
        ))}
      </motion.div>
    </Section>

    <CTASection variant="stories" />
  </>
  );
};

export default SuccessStories;
