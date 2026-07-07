import { useEffect } from "react";
import { Link } from "react-router-dom";
import { SITE, FOOTER_LINKS, SOCIALS } from "../../constants/site.js";
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
  /* Pay the runtime-parse + scene-download costs during idle time so the
     robot's first render never janks an active scroll. */
  useEffect(() => {
    warmSplineScene(ROBOT_SCENE);
  }, []);

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
            Interactive 3D
          </Badge>
          <h2 className="font-display text-3xl font-bold leading-[1.08] tracking-tight text-snow sm:text-4xl">
            Learning that feels <span className="text-gradient-green">alive</span>
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-fog">
            At GOA you don't just watch tutorials — you build immersive
            experiences that capture attention. Go on, drag the robot around.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Button to="/courses" size="lg" magnetic glow cursorLabel="Explore">
              Start building
              <Icon name="ArrowRight" className="size-4" />
            </Button>
            <span className="inline-flex items-center gap-2 font-mono text-xs text-fog">
              <Icon name="Sparkles" className="size-4 text-lime" />
              Powered by Spline
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
          <p className="max-w-sm text-sm leading-relaxed text-fog">{SITE.description}</p>
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-lime">Join the newsletter</p>
            <Newsletter compact />
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {FOOTER_LINKS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 font-mono text-xs uppercase tracking-widest text-fog">{col.title}</h4>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-sm text-mist transition-colors hover:text-lime"
                    >
                      {link.label}
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
          © {new Date().getFullYear()} {SITE.name}. Engineered with care.
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
