import { useTranslation } from "react-i18next";
import Section from "../layout/Section.jsx";
import SectionTitle from "../ui/SectionTitle.jsx";
import Marquee from "../ui/Marquee.jsx";
import TestimonialCard from "../cards/TestimonialCard.jsx";
import { useTestimonials } from "../../data/testimonials.js";

/** TestimonialsSection — two counter-scrolling rows of student quotes. */
const TestimonialsSection = () => {
  const { t } = useTranslation();
  const testimonials = useTestimonials();
  const half = Math.ceil(testimonials.length / 2);
  const rowA = testimonials.slice(0, half);
  const rowB = testimonials.slice(half);

  return (
    <Section id="testimonials" containerClassName="!max-w-none !px-0">
      <div className="container-goa">
        <SectionTitle
          eyebrow={t("testimonials.eyebrow")}
          title={t("testimonials.title")}
          description={t("testimonials.description")}
        />
      </div>

      <div className="mt-14 flex flex-col gap-6">
        <Marquee speed={44}>
          {rowA.map((t) => (
            <TestimonialCard key={t.id} item={t} />
          ))}
        </Marquee>
        <Marquee speed={50} reverse>
          {rowB.map((t) => (
            <TestimonialCard key={t.id} item={t} />
          ))}
        </Marquee>
      </div>
    </Section>
  );
};

export default TestimonialsSection;
