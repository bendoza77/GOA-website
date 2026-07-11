import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import Section from "../layout/Section.jsx";
import SectionTitle from "../ui/SectionTitle.jsx";
import FeatureCard from "../cards/FeatureCard.jsx";
import { useFeatures } from "../../data/features.js";
import { staggerContainer, fadeUp, viewportOnce } from "../../utils/motion.js";

/** FeaturesSection — the "Why GOA" grid of value props. */
const FeaturesSection = () => {
  const { t } = useTranslation();
  const features = useFeatures();
  return (
  <Section id="features">
    <SectionTitle
      eyebrow={t("features.eyebrow")}
      title={t("features.title")}
      description={t("features.description")}
    />

    <motion.div
      variants={staggerContainer(0.08)}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {features.map((f, i) => (
        <motion.div key={i} variants={fadeUp}>
          <FeatureCard {...f} />
        </motion.div>
      ))}
    </motion.div>
  </Section>
  );
};

export default FeaturesSection;
