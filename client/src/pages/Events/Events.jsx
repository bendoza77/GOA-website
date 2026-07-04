import { motion } from "framer-motion";
import PageHeader from "../../components/sections/PageHeader.jsx";
import Section from "../../components/layout/Section.jsx";
import EventCard from "../../components/cards/EventCard.jsx";
import CTASection from "../../components/sections/CTASection.jsx";
import { EVENTS } from "../../data/events.js";
import { staggerContainer, fadeUp } from "../../utils/motion.js";

/** Events — upcoming workshops, talks, hackathons and hiring fairs. */
const Events = () => (
  <>
    <PageHeader
      eyebrow="What's on"
      title="Live workshops, talks &"
      highlight="hiring fairs"
      description="Learn in real time with mentors and peers. Every event is free for GOA members — and most are open to everyone."
    />

    <Section className="!pt-4">
      <motion.div
        variants={staggerContainer(0.08)}
        initial="hidden"
        animate="show"
        className="grid gap-6 lg:grid-cols-2"
      >
        {EVENTS.map((event) => (
          <motion.div key={event.id} variants={fadeUp}>
            <EventCard event={event} />
          </motion.div>
        ))}
      </motion.div>
    </Section>

    <CTASection
      eyebrow="Never miss one"
      title="Get every event in your inbox"
      description="Members get priority access, recordings and exclusive AMAs with mentors from top product teams."
      primary={{ label: "Become a member", to: "/contact" }}
      secondary={{ label: "Explore courses", to: "/courses" }}
    />
  </>
);

export default Events;
