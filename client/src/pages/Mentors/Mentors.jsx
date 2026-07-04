import { motion } from "framer-motion";
import PageHeader from "../../components/sections/PageHeader.jsx";
import Section from "../../components/layout/Section.jsx";
import MentorCard from "../../components/cards/MentorCard.jsx";
import CTASection from "../../components/sections/CTASection.jsx";
import { MENTORS } from "../../data/mentors.js";
import { staggerContainer, fadeUp } from "../../utils/motion.js";

/** Mentors — full roster grid. */
const Mentors = () => (
  <>
    <PageHeader
      eyebrow="The people"
      title="Mentors who have"
      highlight="shipped it"
      description="Working engineers and designers from the teams you admire — here to unblock you, review your code, and push your craft."
    />

    <Section className="!pt-4">
      <motion.div
        variants={staggerContainer(0.07)}
        initial="hidden"
        animate="show"
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {MENTORS.map((m) => (
          <motion.div key={m.id} variants={fadeUp}>
            <MentorCard mentor={m} />
          </motion.div>
        ))}
      </motion.div>
    </Section>

    <CTASection
      eyebrow="Become a mentor"
      title="Shipped something you're proud of? Pay it forward."
      description="Join our mentor network, sharpen your leadership, and help engineer the next generation of builders."
      primary={{ label: "Apply to mentor", to: "/contact" }}
      secondary={{ label: "See the community", to: "/community" }}
    />
  </>
);

export default Mentors;
