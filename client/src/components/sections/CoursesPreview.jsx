import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import Section from "../layout/Section.jsx";
import SectionTitle from "../ui/SectionTitle.jsx";
import CourseCard from "../cards/CourseCard.jsx";
import Button from "../ui/Button.jsx";
import Icon from "../ui/Icon.jsx";
import { useCourses } from "../../data/courses.js";
import { staggerContainer, fadeUp, viewportOnce } from "../../utils/motion.js";

/** CoursesPreview — a curated subset of the catalogue for the home page. */
const CoursesPreview = () => {
  const { t } = useTranslation();
  const courses = useCourses();
  return (
  <Section id="courses">
    <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-end sm:justify-between">
      <SectionTitle
        align="left"
        eyebrow={t("coursesPreview.eyebrow")}
        title={t("coursesPreview.title")}
        description={t("coursesPreview.description")}
        className="!mx-0"
      />
      <Button to="/courses" variant="outline" cursorLabel="All" className="shrink-0">
        {t("coursesPreview.viewAll")}
        <Icon name="ArrowRight" className="size-4" />
      </Button>
    </div>

    <motion.div
      variants={staggerContainer(0.08)}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {courses.slice(0, 6).map((course) => (
        <motion.div key={course.id} variants={fadeUp}>
          <CourseCard course={course} />
        </motion.div>
      ))}
    </motion.div>
  </Section>
  );
};

export default CoursesPreview;
