import { useTranslation } from "react-i18next";
import Section from "../layout/Section.jsx";
import SectionTitle from "../ui/SectionTitle.jsx";
import Accordion from "../ui/Accordion.jsx";
import Reveal from "../ui/Reveal.jsx";
import { useFaqs } from "../../data/faq.js";

/** FAQSection — split layout: sticky title + animated accordion. */
const FAQSection = () => {
  const { t } = useTranslation();
  const faqs = useFaqs();
  return (
  <Section id="faq">
    <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="lg:sticky lg:top-28 lg:h-fit">
        <SectionTitle
          align="left"
          eyebrow={t("faq.eyebrow")}
          title={t("faq.title")}
          description={t("faq.description")}
          className="!mx-0"
        />
      </div>
      <Reveal>
        <Accordion items={faqs} />
      </Reveal>
    </div>
  </Section>
  );
};

export default FAQSection;
