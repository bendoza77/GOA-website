import { useTranslation } from "react-i18next";
import { courseWindow, COURSE_COUNT } from "../worldTimeline.js";
import CopyMoment from "./CopyMoment.jsx";

/**
 * CourseMoments — the copy half of the six course artifacts.
 *
 * The 3D document assembles beside the road (documents.js); its title and
 * one cinematic line surface here in the DOM, crisp and localised, on the
 * opposite side of the frame from the artifact so word and object share
 * the shot like a film two-shot. Alternates left/right with the road's sway.
 */
const CourseMoments = () => {
  const { t } = useTranslation();
  const items = t("courses.items", { returnObjects: true });
  const lines = t("world.courses", { returnObjects: true });

  if (!Array.isArray(items)) return null;

  return (
    <>
      {Array.from({ length: COURSE_COUNT }, (_, i) => {
        const course = items[i] ?? {};
        const line = Array.isArray(lines) ? lines[i]?.line : "";
        return (
          <CopyMoment
            key={i}
            window={courseWindow(i)}
            /* artifacts alternate right/left along the bends — copy takes
               the other side of the frame */
            position={i % 2 === 0 ? "left" : "right"}
            index={String(i + 1).padStart(2, "0")}
            eyebrow={t("world.coursesEyebrow")}
            title={course.title}
            sub={line}
            meta={[course.level, course.duration].filter(Boolean).join(" · ")}
          />
        );
      })}
    </>
  );
};

export default CourseMoments;
