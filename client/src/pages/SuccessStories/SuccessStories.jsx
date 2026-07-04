import { motion } from "framer-motion";
import PageHeader from "../../components/sections/PageHeader.jsx";
import Section from "../../components/layout/Section.jsx";
import StoryCard from "../../components/cards/StoryCard.jsx";
import StatCard from "../../components/cards/StatCard.jsx";
import CTASection from "../../components/sections/CTASection.jsx";
import { SUCCESS_STORIES } from "../../data/successStories.js";
import { HERO_STATS } from "../../data/stats.js";
import { staggerContainer, fadeUp, viewportOnce } from "../../utils/motion.js";

/** SuccessStories — outcome-focused transformations + proof metrics. */
const SuccessStories = () => (
  <>
    <PageHeader
      eyebrow="Proof"
      title="Real people, real"
      highlight="transformations"
      description="No survivorship theatre — just the before, the after, and the number that changed. This is what outcome-driven looks like."
    />

    <Section className="!pt-4">
      <motion.div
        variants={staggerContainer(0.1)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="grid gap-8 rounded-3xl border border-slate-line surface p-10 sm:grid-cols-2 lg:grid-cols-4"
      >
        {HERO_STATS.map((s) => (
          <motion.div key={s.label} variants={fadeUp}>
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
        {SUCCESS_STORIES.map((story) => (
          <motion.div key={story.id} variants={fadeUp}>
            <StoryCard story={story} />
          </motion.div>
        ))}
      </motion.div>
    </Section>

    <CTASection
      eyebrow="Your turn"
      title="The next story on this page could be yours"
      description="Join a cohort, do the work, and let the outcome speak for itself. We'll be with you the whole way."
    />
  </>
);

export default SuccessStories;
