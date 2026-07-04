import { motion } from "framer-motion";
import Section from "../layout/Section.jsx";
import SectionTitle from "../ui/SectionTitle.jsx";
import FeatureCard from "../cards/FeatureCard.jsx";
import { FEATURES } from "../../data/features.js";
import { staggerContainer, fadeUp, viewportOnce } from "../../utils/motion.js";

/** FeaturesSection — the "Why GOA" grid of value props. */
const FeaturesSection = () => (
  <Section id="features">
    <SectionTitle
      eyebrow="Why GOA"
      title="A learning system built for real outcomes"
      description="Everything is engineered around one goal: turning your effort into a career you're proud of."
    />

    <motion.div
      variants={staggerContainer(0.08)}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {FEATURES.map((f) => (
        <motion.div key={f.title} variants={fadeUp}>
          <FeatureCard {...f} />
        </motion.div>
      ))}
    </motion.div>
  </Section>
);

export default FeaturesSection;
