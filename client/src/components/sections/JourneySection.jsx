import Section from "../layout/Section.jsx";
import SectionTitle from "../ui/SectionTitle.jsx";
import Timeline from "../ui/Timeline.jsx";
import { JOURNEY } from "../../data/journey.js";

/** JourneySection — the five-step learner journey on an animated spine. */
const JourneySection = () => (
  <Section id="journey" className="relative">
    <SectionTitle
      eyebrow="The path"
      title="From first commit to signed offer"
      description="A clear, guided journey — you always know what to do next and why it matters."
    />
    <div className="mt-16">
      <Timeline steps={JOURNEY} />
    </div>
  </Section>
);

export default JourneySection;
