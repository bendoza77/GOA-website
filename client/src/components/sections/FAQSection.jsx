import Section from "../layout/Section.jsx";
import SectionTitle from "../ui/SectionTitle.jsx";
import Accordion from "../ui/Accordion.jsx";
import Reveal from "../ui/Reveal.jsx";
import { FAQS } from "../../data/faq.js";

/** FAQSection — split layout: sticky title + animated accordion. */
const FAQSection = () => (
  <Section id="faq">
    <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="lg:sticky lg:top-28 lg:h-fit">
        <SectionTitle
          align="left"
          eyebrow="FAQ"
          title="Questions, answered"
          description="Everything you need to know before you join a cohort. Still curious? Reach out any time."
          className="!mx-0"
        />
      </div>
      <Reveal>
        <Accordion items={FAQS} />
      </Reveal>
    </div>
  </Section>
);

export default FAQSection;
