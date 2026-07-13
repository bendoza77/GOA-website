import { useTranslation } from "react-i18next";
import { CHAPTERS } from "../worldTimeline.js";
import CopyMoment from "./CopyMoment.jsx";
import CourseMoments from "./CourseMoments.jsx";
import StoryMoment from "./StoryMoment.jsx";
import VideoSequence from "./VideoSequence.jsx";
import FinaleMoment from "./FinaleMoment.jsx";

/**
 * WorldOverlay — every word the world speaks, composed over the 3D canvas.
 *
 * One fixed, pointer-transparent layer of scroll-windowed moments. The
 * windows come from worldTimeline, the same source the engine reads, so
 * copy always lands exactly when its chapter is on screen.
 */
const WorldOverlay = () => {
  const { t } = useTranslation();

  return (
    <div className="relative z-10">
      {/* arrival — the visitor realises where they are */}
      <CopyMoment
        window={[0.006, CHAPTERS.arrival[1]]}
        position="center"
        big
        eyebrow={t("world.arrival.eyebrow")}
        title={t("world.arrival.title")}
        sub={t("world.arrival.sub")}
      />

      {/* the road is born */}
      <CopyMoment
        window={[CHAPTERS.roadIntro[0] + 0.005, CHAPTERS.roadIntro[1] + 0.015]}
        position="lower"
        eyebrow={t("world.road.eyebrow")}
        title={t("world.road.title")}
        sub={t("world.road.sub")}
      />

      {/* six artifacts along the road */}
      <CourseMoments />

      {/* the emotional centre */}
      <StoryMoment />

      {/* the films */}
      <VideoSequence />

      {/* the monument */}
      <CopyMoment
        window={[CHAPTERS.gMark[0] + 0.035, CHAPTERS.gMark[1] - 0.01]}
        position="lower"
        eyebrow={t("world.g.eyebrow")}
        title={t("world.g.title")}
      />

      {/* the last light */}
      <FinaleMoment />
    </div>
  );
};

export default WorldOverlay;
