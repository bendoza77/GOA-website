import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import PageHeader from "../../components/sections/PageHeader.jsx";
import Section from "../../components/layout/Section.jsx";
import EventCard from "../../components/cards/EventCard.jsx";
import CTASection from "../../components/sections/CTASection.jsx";
import AmbientScene from "../../components/3d/ambient/AmbientScene.jsx";
import { useEvents } from "../../data/events.js";
import { staggerContainer, slideInLeft, slideInRight } from "../../utils/motion.js";

/** Events — upcoming workshops, talks, hackathons and hiring fairs. */
const Events = () => {
  const { t } = useTranslation();
  const events = useEvents();
  return (
  <>
    {/* Page ambience — the time ring with orbiting tickets */}
    <AmbientScene scene="events" />
    <PageHeader
      eyebrow={t("eventsPage.header.eyebrow")}
      title={t("eventsPage.header.title")}
      highlight={t("eventsPage.header.highlight")}
      description={t("eventsPage.header.description")}
    />

    <Section className="!pt-4">
      <motion.div
        variants={staggerContainer(0.08)}
        initial="hidden"
        animate="show"
        className="grid gap-6 lg:grid-cols-2"
      >
        {events.map((event, i) => (
          <motion.div key={event.id} variants={i % 2 ? slideInRight : slideInLeft}>
            <EventCard event={event} />
          </motion.div>
        ))}
      </motion.div>
    </Section>

    <CTASection variant="events" />
  </>
  );
};

export default Events;
