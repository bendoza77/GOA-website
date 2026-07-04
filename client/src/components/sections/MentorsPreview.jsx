import { motion } from "framer-motion";
import Section from "../layout/Section.jsx";
import SectionTitle from "../ui/SectionTitle.jsx";
import MentorCard from "../cards/MentorCard.jsx";
import Button from "../ui/Button.jsx";
import Icon from "../ui/Icon.jsx";
import { MENTORS } from "../../data/mentors.js";
import { staggerContainer, fadeUp, viewportOnce } from "../../utils/motion.js";

/** MentorsPreview — meet-the-mentors grid teaser. */
const MentorsPreview = () => (
  <Section id="mentors">
    <SectionTitle
      eyebrow="Mentorship"
      title="Learn from people who ship"
      description="Every mentor is a working engineer or designer from a team you'd love to join — invested in your next step."
    />

    <motion.div
      variants={staggerContainer(0.08)}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {MENTORS.slice(0, 3).map((m) => (
        <motion.div key={m.id} variants={fadeUp}>
          <MentorCard mentor={m} />
        </motion.div>
      ))}
    </motion.div>

    <div className="mt-10 flex justify-center">
      <Button to="/mentors" variant="outline" cursorLabel="Meet">
        Meet all mentors
        <Icon name="ArrowRight" className="size-4" />
      </Button>
    </div>
  </Section>
);

export default MentorsPreview;
