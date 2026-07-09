import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SITE, FOOTER_LINK_PATHS, SOCIALS } from "../../constants/site.js";
import Logo from "../ui/Logo.jsx";
import SocialIcon from "../ui/SocialIcon.jsx";
import Newsletter from "../forms/Newsletter.jsx";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import Icon from "../ui/Icon.jsx";
import SplineScene from "../3d/SplineScene.jsx";
import FloatingObjects from "../3d/FloatingObjects.jsx";
import { warmSplineScene } from "../../utils/splineWarmup.js";

/* The interactive robot lives here — at the end of the page, after the
   scroll-driven 3D story has finished — so its render cost never competes
   with the journey canvas mid-scroll. */
const ROBOT_SCENE = "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";

/**
 * Footer — interactive 3D finale, sitemap, newsletter, socials + oversized
 * brand watermark. The robot band mounts lazily (near-viewport) and pauses
 * whenever it's off-screen, so pages stay light until the user actually
 * reaches the bottom.
 */
const Footer = () => {
  const { t } = useTranslation();

  /* Pay the runtime-parse + scene-download costs during idle time so the
     robot's first render never janks an active scroll. */
  useEffect(() => {
    warmSplineScene(ROBOT_SCENE);
  }, []);

  const columns = t("footer.columns", { returnObjects: true });

  return (
  <footer className="relative mt-24 overflow-hidden border-t border-slate-line bg-ink/60">
    <div className="absolute inset-0 bg-grid bg-grid-fade opacity-20" />
    <div className="container-goa relative py-16">
      {/* Interactive 3D finale — copy left, draggable robot right */}
      <div className="relative mb-16 grid items-center gap-10 border-b border-slate-line pb-16 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Soft lime glow anchoring the robot side */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 right-0 hidden h-[420px] w-[420px] rounded-full opacity-25 blur-3xl lg:block"
          style={{ background: "radial-gradient(circle, var(--color-lime, #7dff9e) 0%, transparent 65%)" }}
        />

        <div className="relative z-10 flex flex-col items-start gap-5">
          <Badge dot pixel tone="neon">
            {t("footer.badge")}
          </Badge>
          <h2 className="font-display text-3xl font-bold leading-[1.08] tracking-tight text-snow sm:text-4xl">
            {t("footer.headline")} <span className="text-gradient-green">{t("footer.headlineHighlight")}</span>
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-fog">
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

        <div className="relative mx-auto h-[320px] w-full max-w-lg sm:h-[400px] lg:h-[440px]">
          <SplineScene
            scene={ROBOT_SCENE}
            className="h-full w-full"
            fallback={<FloatingObjects />}
          />
        </div>
      </div>

      <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
        {/* Brand + newsletter */}
        <div className="flex flex-col gap-6">
          <Logo size={40} />
          <p className="max-w-sm text-sm leading-relaxed text-fog">{t("footer.brandDescription")}</p>
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-lime">{t("newsletter.join")}</p>
            <Newsletter compact />
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {columns.map((col, ci) => (
            <div key={col.title}>
              <h4 className="mb-4 font-mono text-xs uppercase tracking-widest text-fog">{col.title}</h4>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((label, li) => (
                  <li key={label}>
                    <Link
                      to={FOOTER_LINK_PATHS[ci]?.[li] || "/"}
                      className="text-sm text-mist transition-colors hover:text-lime"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-14 flex flex-col items-center justify-between gap-6 border-t border-slate-line pt-8 sm:flex-row">
        <p className="font-mono text-xs text-fog">
          © {new Date().getFullYear()} {SITE.name}. {t("footer.rights")}
        </p>
        <div className="flex items-center gap-3">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              aria-label={s.label}
              className="grid size-9 place-items-center rounded-full border border-slate-line text-fog transition-all hover:-translate-y-0.5 hover:border-lime/40 hover:text-lime"
            >
              <SocialIcon name={s.icon} className="size-4" />
            </a>
          ))}
        </div>
      </div>
    </div>

    {/* Oversized brand watermark */}
    <div className="pointer-events-none select-none overflow-hidden">
      <div
        className="bg-clip-text text-center font-display text-[22vw] font-bold leading-none text-transparent"
        style={{ backgroundImage: "linear-gradient(to bottom, var(--watermark), transparent)" }}
      >
        GOA
      </div>
    </div>
  </footer>
  );
};

export default Footer;
