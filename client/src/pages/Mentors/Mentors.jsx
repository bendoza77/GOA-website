import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import PageHeader from "../../components/sections/PageHeader.jsx";
import Section from "../../components/layout/Section.jsx";
import MentorCard from "../../components/cards/MentorCard.jsx";
import CTASection from "../../components/sections/CTASection.jsx";
import AmbientScene from "../../components/3d/ambient/AmbientScene.jsx";
import { useMentors } from "../../data/mentors.js";
import { staggerContainer, tiltIn } from "../../utils/motion.js";

/** Mentors — full roster grid. */
const Mentors = () => {
  const { t } = useTranslation();
  const mentors = useMentors();
  return (
  <>
    {/* Page ambience — the mentor constellation network */}
    <AmbientScene scene="mentors" />
    <PageHeader
      eyebrow={t("mentorsPage.header.eyebrow")}
      title={t("mentorsPage.header.title")}
      highlight={t("mentorsPage.header.highlight")}
      description={t("mentorsPage.header.description")}
    />

    <Section className="!pt-4">
      <motion.div
        variants={staggerContainer(0.07)}
        initial="hidden"
        animate="show"
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {mentors.map((m) => (
          <motion.div key={m.id} variants={tiltIn}>
            <MentorCard mentor={m} />
          </motion.div>
        ))}
      </motion.div>
    </Section>

    <CTASection variant="mentors" />
  </>
  );
};

export default Mentors;
