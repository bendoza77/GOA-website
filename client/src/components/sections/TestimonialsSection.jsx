import Section from "../layout/Section.jsx";
import SectionTitle from "../ui/SectionTitle.jsx";
import Marquee from "../ui/Marquee.jsx";
import TestimonialCard from "../cards/TestimonialCard.jsx";
import { TESTIMONIALS } from "../../data/testimonials.js";

/** TestimonialsSection — two counter-scrolling rows of student quotes. */
const TestimonialsSection = () => {
  const half = Math.ceil(TESTIMONIALS.length / 2);
  const rowA = TESTIMONIALS.slice(0, half);
  const rowB = TESTIMONIALS.slice(half);

  return (
    <Section id="testimonials" containerClassName="!max-w-none !px-0">
      <div className="container-goa">
        <SectionTitle
          eyebrow="Loved by learners"
          title="Careers changed, in their words"
          description="Thousands have used GOA to break in, level up and land the role they were after."
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
