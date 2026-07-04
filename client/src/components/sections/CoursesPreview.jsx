import { motion } from "framer-motion";
import Section from "../layout/Section.jsx";
import SectionTitle from "../ui/SectionTitle.jsx";
import CourseCard from "../cards/CourseCard.jsx";
import Button from "../ui/Button.jsx";
import Icon from "../ui/Icon.jsx";
import { COURSES } from "../../data/courses.js";
import { staggerContainer, fadeUp, viewportOnce } from "../../utils/motion.js";

/** CoursesPreview — a curated subset of the catalogue for the home page. */
const CoursesPreview = () => (
  <Section id="courses">
    <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-end sm:justify-between">
      <SectionTitle
        align="left"
        eyebrow="Curriculum"
        title="Tracks that lead somewhere"
        description="Pick a path or combine them. Every track is project-first and mapped to real hiring signals."
        className="!mx-0"
      />
      <Button to="/courses" variant="outline" cursorLabel="All" className="shrink-0">
        View all courses
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
      {COURSES.slice(0, 6).map((course) => (
        <motion.div key={course.id} variants={fadeUp}>
          <CourseCard course={course} />
        </motion.div>
      ))}
    </motion.div>
  </Section>
);

export default CoursesPreview;
