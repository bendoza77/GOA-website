import { useTranslation } from "react-i18next";
import { LogoMark } from "../components/ui/Logo.jsx";
import LanguageToggle from "../components/ui/LanguageToggle.jsx";
import WorldMenu from "./overlay/WorldMenu.jsx";

/**
 * WorldFallback — the journey, told still.
 *
 * When animations are off (prefers-reduced-motion or the user's toggle),
 * the 3D universe and its scroll choreography step aside and the same
 * story is presented as a calm, readable narrative: arrival, the road,
 * the six courses, the story, the mark, the ending. Same copy, same
 * order, zero motion.
 */
const WorldFallback = () => {
  const { t } = useTranslation();
  const courses = t("courses.items", { returnObjects: true });
  const lines = t("world.courses", { returnObjects: true });

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-20 px-6 py-20">
      <header className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2.5 font-display font-bold">
          <LogoMark size={34} />
          <span className="text-lg text-snow">GOA</span>
        </span>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <WorldMenu />
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <span className="font-mono text-xs uppercase tracking-[0.45em] text-neon">
          {t("world.arrival.eyebrow")}
        </span>
        <h1 className="font-display text-4xl font-bold tracking-tight text-snow sm:text-5xl">
          {t("world.arrival.title")}
        </h1>
        <p className="text-lg text-mist">{t("world.arrival.sub")}</p>
      </section>

      <section className="flex flex-col gap-3">
        <span className="font-mono text-xs uppercase tracking-[0.45em] text-neon">
          {t("world.road.eyebrow")}
        </span>
        <h2 className="font-display text-2xl font-bold text-snow">{t("world.road.title")}</h2>
        <p className="text-mist">{t("world.road.sub")}</p>
      </section>

      <section className="flex flex-col gap-10">
        {Array.isArray(courses) &&
          courses.map((course, i) => (
            <article key={i} className="flex flex-col gap-2 border-l border-neon/25 pl-6">
              <span className="font-mono text-xs tracking-[0.3em] text-lime">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display text-xl font-bold text-snow">{course.title}</h3>
              <p className="text-mist">{Array.isArray(lines) ? lines[i]?.line : ""}</p>
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-fog">
                {[course.level, course.duration].filter(Boolean).join(" · ")}
              </span>
            </article>
          ))}
      </section>

      <section className="flex flex-col gap-3 py-10 text-center">
        <p className="font-display text-3xl font-bold text-snow">{t("world.story.line1")}</p>
        <p className="font-display text-2xl font-semibold text-neon">{t("world.story.line2")}</p>
      </section>

      <section className="flex flex-col items-center gap-6 text-center">
        <LogoMark size={56} />
        <p className="font-display text-2xl font-bold text-snow">{t("world.finale.end")}</p>
      </section>
    </main>
  );
};

export default WorldFallback;
