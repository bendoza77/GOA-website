import { useTranslation } from "react-i18next";
import Section from "../layout/Section.jsx";
import SectionTitle from "../ui/SectionTitle.jsx";
import Timeline from "../ui/Timeline.jsx";
import { useJourney } from "../../data/journey.js";

/** JourneySection — the five-step learner journey on an animated spine. */
const JourneySection = () => {
  const { t } = useTranslation();
  const journey = useJourney();
  return (
  <Section id="journey" className="relative">
    <SectionTitle
      eyebrow={t("journey.eyebrow")}
      title={t("journey.title")}
      description={t("journey.description")}
    />
    <div className="mt-16">
      <Timeline steps={journey} />
    </div>
  </Section>
  );
};

export default JourneySection;
