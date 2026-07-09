import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import Icon from "../ui/Icon.jsx";
import SplineScene from "../3d/SplineScene.jsx";
import FloatingObjects from "../3d/FloatingObjects.jsx";
import { warmSplineScene } from "../../utils/splineWarmup.js";

/* The interactive robot lives at the very bottom of Home — after the whole
   scroll story — so its one-time scene-build cost never competes with the
   journey/cube canvases mid-scroll. */
const ROBOT_SCENE = "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";

/**
 * RobotShowcase — the interactive 3D finale for the Home page: copy on the
 * left, a draggable robot on the right. Mounts lazily (near-viewport + scroll
 * lull, see SplineScene) and pauses whenever off-screen, and the whole section
 * is `content-visibility: auto` so it costs nothing to lay out or paint until
 * the user scrolls down to it.
 */
const RobotShowcase = () => {
  const { t } = useTranslation();

  /* Pay the runtime-parse + scene-download costs during idle time so the
     robot's first render never janks an active scroll. */
  useEffect(() => {
    warmSplineScene(ROBOT_SCENE);
  }, []);

  return (
    <section
      className="relative overflow-hidden py-20 sm:py-28"
      style={{ contentVisibility: "auto", containIntrinsicSize: "1px 620px" }}
    >
      {/* Soft lime glow anchoring the robot side */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/4 right-0 hidden h-[420px] w-[420px] rounded-full opacity-25 blur-3xl lg:block"
        style={{ background: "radial-gradient(circle, var(--color-lime, #7dff9e) 0%, transparent 65%)" }}
      />

      <div className="container-goa relative grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative z-10 flex flex-col items-start gap-5">
          <Badge dot pixel tone="neon">
            {t("footer.badge")}
          </Badge>
          <h2 className="font-display text-3xl font-bold leading-[1.08] tracking-tight text-snow sm:text-4xl md:text-5xl">
            {t("footer.headline")}{" "}
            <span className="text-gradient-green">{t("footer.headlineHighlight")}</span>
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-fog sm:text-base">
            {t("footer.blurb")}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Button to="/courses" size="lg" magnetic glow cursorLabel="Explore">
              {t("footer.startBuilding")}
              <Icon name="ArrowRight" className="size-4" />
            </Button>
            <span className="inline-flex items-center gap-2 font-mono text-xs text-fog">
              <Icon name="Sparkles" className="size-4 text-lime" />
              {t("footer.poweredBy")}
            </span>
          </div>
        </div>

        <div className="relative mx-auto h-[320px] w-full max-w-lg sm:h-[400px] lg:h-[460px]">
          <SplineScene
            scene={ROBOT_SCENE}
            className="h-full w-full"
            fallback={<FloatingObjects />}
          />
        </div>
      </div>
    </section>
  );
};

export default RobotShowcase;
