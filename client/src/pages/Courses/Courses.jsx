import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import PageHeader from "../../components/sections/PageHeader.jsx";
import Section from "../../components/layout/Section.jsx";
import SectionTitle from "../../components/ui/SectionTitle.jsx";
import CourseCard from "../../components/cards/CourseCard.jsx";
import PricingCard from "../../components/cards/PricingCard.jsx";
import CTASection from "../../components/sections/CTASection.jsx";
import AmbientScene from "../../components/3d/ambient/AmbientScene.jsx";
import { useCourses, useCourseCategories, usePlans } from "../../data/courses.js";
import { staggerContainer, fadeUp, depthIn, viewportOnce } from "../../utils/motion.js";
import { cn } from "../../utils/cn.js";

/** Courses — filterable catalogue + pricing plans. */
const Courses = () => {
  const { t } = useTranslation();
  const courses = useCourses();
  const categories = useCourseCategories();
  const plans = usePlans();
  const [active, setActive] = useState("all");

  const filtered = useMemo(() => {
    if (active === "all") return courses;
    return courses.filter((c) => c.category === active);
  }, [active, courses]);

  return (
    <>
      {/* Page ambience — the curriculum helix of floating books */}
      <AmbientScene scene="courses" />
      <PageHeader
        eyebrow={t("coursesPage.header.eyebrow")}
        title={t("coursesPage.header.title")}
        highlight={t("coursesPage.header.highlight")}
        description={t("coursesPage.header.description")}
      >
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActive(cat.key)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-300",
                active === cat.key
                  ? "border-lime/40 bg-lime/10 text-lime"
                  : "border-slate-line text-fog hover:border-ash hover:text-mist"
              )}
            >
              {cat.label}
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
          <p className="py-16 text-center text-fog">{t("coursesPage.empty")}</p>
        )}
      </Section>

      <Section id="pricing">
        <SectionTitle
          eyebrow={t("coursesPage.pricing.eyebrow")}
          title={t("coursesPage.pricing.title")}
          description={t("coursesPage.pricing.description")}
        />
        <motion.div
          variants={staggerContainer(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-14 grid gap-6 lg:grid-cols-3"
        >
          {plans.map((plan, i) => (
            <motion.div key={i} variants={depthIn}>
              <PricingCard plan={plan} />
            </motion.div>
          ))}
        </motion.div>
        <p className="mt-6 text-center font-mono text-xs text-fog">
          {t("coursesPage.pricing.guarantee")}
        </p>
      </Section>

      <CTASection />
    </>
  );
};

export default Courses;
