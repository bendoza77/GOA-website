import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import Section from "../layout/Section.jsx";
import SectionTitle from "../ui/SectionTitle.jsx";
import MentorCard from "../cards/MentorCard.jsx";
import Button from "../ui/Button.jsx";
import Icon from "../ui/Icon.jsx";
import { useMentors } from "../../data/mentors.js";
import { staggerContainer, fadeUp, viewportOnce } from "../../utils/motion.js";

/** MentorsPreview — meet-the-mentors grid teaser. */
const MentorsPreview = () => {
  const { t } = useTranslation();
  const mentors = useMentors();
  return (
  <Section id="mentors">
    <SectionTitle
      eyebrow={t("mentorsSection.eyebrow")}
      title={t("mentorsSection.title")}
      description={t("mentorsSection.description")}
    />

    <motion.div
      variants={staggerContainer(0.08)}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {mentors.slice(0, 3).map((m) => (
        <motion.div key={m.id} variants={fadeUp}>
          <MentorCard mentor={m} />
        </motion.div>
      ))}
    </motion.div>

    <div className="mt-10 flex justify-center">
      <Button to="/mentors" variant="outline" cursorLabel="Meet">
        {t("mentorsSection.meetAll")}
        <Icon name="ArrowRight" className="size-4" />
      </Button>
    </div>
  </Section>
  );
};

export default MentorsPreview;
