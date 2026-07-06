import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import PageHeader from "../../components/sections/PageHeader.jsx";
import Section from "../../components/layout/Section.jsx";
import SectionTitle from "../../components/ui/SectionTitle.jsx";
import CourseCard from "../../components/cards/CourseCard.jsx";
import PricingCard from "../../components/cards/PricingCard.jsx";
import CTASection from "../../components/sections/CTASection.jsx";
import AmbientScene from "../../components/3d/ambient/AmbientScene.jsx";
import { COURSES, COURSE_CATEGORIES } from "../../data/courses.js";
import { staggerContainer, fadeUp, depthIn, viewportOnce } from "../../utils/motion.js";
import { cn } from "../../utils/cn.js";

const PLANS = [
  {
    name: "Single Track",
    tagline: "Focus on one skill, master it.",
    price: "$1,490",
    period: "track",
    cta: "Choose track",
    features: ["One full course track", "1:1 mentor sessions", "Project reviews", "Community access", "Certificate"],
  },
  {
    name: "Career Program",
    tagline: "Go from zero to hired.",
    price: "$2,890",
    period: "program",
    featured: true,
    cta: "Start career track",
    features: ["Everything in Single Track", "Multiple tracks bundled", "Weekly live mentorship", "Mock interviews + referrals", "Lifetime career support", "Job guarantee*"],
  },
  {
    name: "Teams",
    tagline: "Upskill your whole team.",
    price: "Custom",
    cta: "Talk to us",
    features: ["Volume licensing", "Dedicated success manager", "Custom curriculum", "Progress dashboards", "Priority support"],
  },
];

/** Courses — filterable catalogue + pricing plans. */
const Courses = () => {
  const [active, setActive] = useState("All");

  const filtered = useMemo(() => {
    if (active === "All") return COURSES;
    return COURSES.filter((c) =>
      `${c.title} ${c.tag}`.toLowerCase().includes(active.toLowerCase())
    );
  }, [active]);

  return (
    <>
      {/* Page ambience — the curriculum helix of floating books */}
      <AmbientScene scene="courses" />
      <PageHeader
        eyebrow="Curriculum"
        title="Courses that turn effort into"
        highlight="outcomes"
        description="Project-first tracks across the modern stack — each mapped to a real hiring signal. Filter to find your path."
      >
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {COURSE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-300",
                active === cat
                  ? "border-lime/40 bg-lime/10 text-lime"
                  : "border-slate-line text-fog hover:border-ash hover:text-mist"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </PageHeader>

      <Section className="!pt-4">
        <motion.div
          key={active}
          variants={staggerContainer(0.07)}
          initial="hidden"
          animate="show"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((course) => (
            <motion.div key={course.id} variants={fadeUp}>
              <CourseCard course={course} />
            </motion.div>
          ))}
        </motion.div>
        {filtered.length === 0 && (
          <p className="py-16 text-center text-fog">No courses in this category yet — check back soon.</p>
        )}
      </Section>

      <Section id="pricing">
        <SectionTitle
          eyebrow="Pricing"
          title="Invest in the version of you that ships"
          description="Transparent pricing, flexible plans, and a guarantee. Scholarships available for every cohort."
        />
        <motion.div
          variants={staggerContainer(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-14 grid gap-6 lg:grid-cols-3"
        >
          {PLANS.map((plan) => (
            <motion.div key={plan.name} variants={depthIn}>
              <PricingCard plan={plan} />
            </motion.div>
          ))}
        </motion.div>
        <p className="mt-6 text-center font-mono text-xs text-fog">
          * Job guarantee applies to eligible Career Program students. Terms apply.
        </p>
      </Section>

      <CTASection />
    </>
  );
};

export default Courses;
