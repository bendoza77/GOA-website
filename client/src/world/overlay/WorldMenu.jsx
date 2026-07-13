import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { LogoMark } from "../../components/ui/Logo.jsx";
import { useCursor } from "../../hooks/useCursor.js";

/**
 * WorldMenu — the only doorway out of the scroll journey.
 *
 * A quiet button beside the language toggle opens a side menu that glides
 * in from the right (heavy expo easing, staggered item reveals). Its three
 * destinations — Services, Privacy & Policy, Terms — are not routes: each
 * opens a full-screen reading panel that slides over the world and slides
 * away again, so the journey underneath never resets.
 *
 * While anything is open the world's scroll is frozen (Lenis stopped +
 * overflow locked); Escape steps back one level at a time.
 */
const EASE = [0.16, 1, 0.3, 1];
const PAGES = ["services", "privacy", "terms"];

const WorldMenu = () => {
  const { t } = useTranslation();
  const { cursorProps } = useCursor();
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(null);

  /* freeze the journey while the menu owns the screen */
  useEffect(() => {
    const locked = open || page;
    if (!locked) return;
    window.__lenis?.stop();
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
      window.__lenis?.start();
    };
  }, [open, page]);

  /* Escape steps back: page → menu → world */
  useEffect(() => {
    if (!open && !page) return;
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (page) setPage(null);
      else setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, page]);

  const closeAll = () => {
    setPage(null);
    setOpen(false);
  };

  return (
    <>
      {/* the button — a two-line mark that breathes on hover */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("world.menu.open")}
        aria-expanded={open}
        className="group relative grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-[color:var(--hairline)] text-mist transition-colors duration-300 hover:border-lime/40 hover:text-lime"
        {...cursorProps("button", t("world.menu.open"))}
      >
        <span className="pointer-events-none absolute inset-0 scale-0 rounded-full bg-lime/10 transition-transform duration-300 group-hover:scale-100" />
        <span className="relative flex w-4 flex-col gap-[5px]">
          <span className="h-px w-full bg-current transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-2/3" />
          <span className="h-px w-full bg-current" />
        </span>
      </button>

      {typeof document !== "undefined" &&
        createPortal(
          <>
            {/* ---- drawer ---- */}
            <AnimatePresence>
              {open && (
                <>
                  <motion.div
                    key="backdrop"
                    className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: EASE }}
                    onClick={closeAll}
                  />
                  <motion.aside
                    key="drawer"
                    role="dialog"
                    aria-modal="true"
                    aria-label={t("world.menu.title")}
                    data-lenis-prevent
                    className="fixed inset-y-0 right-0 z-[81] flex w-[min(92vw,27rem)] flex-col overflow-y-auto overscroll-contain border-l border-[color:var(--hairline)] bg-ink/90 px-8 py-7 backdrop-blur-2xl sm:px-10"
                    initial={{ x: "104%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "104%" }}
                    transition={{ duration: 0.7, ease: EASE }}
                  >
                    <div className="flex items-center justify-between">
                      <motion.span
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0, transition: { delay: 0.25, duration: 0.5, ease: EASE } }}
                        className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.45em] text-neon"
                      >
                        {t("world.menu.title")}
                      </motion.span>
                      <CloseButton onClick={closeAll} label={t("world.menu.close")} />
                    </div>

                    <nav className="mt-12 flex flex-col">
                      {PAGES.map((key, i) => (
                        <motion.button
                          key={key}
                          type="button"
                          onClick={() => setPage(key)}
                          initial={{ x: 64, opacity: 0 }}
                          animate={{
                            x: 0,
                            opacity: 1,
                            transition: { delay: 0.16 + i * 0.08, duration: 0.65, ease: EASE },
                          }}
                          exit={{ opacity: 0, transition: { duration: 0.2 } }}
                          className="group flex items-baseline gap-5 border-b border-[color:var(--hairline)] py-6 text-left"
                          {...cursorProps("button")}
                        >
                          <span className="font-mono text-xs text-lime/60 transition-colors duration-500 group-hover:text-lime">
                            0{i + 1}
                          </span>
                          <span className="font-display text-2xl font-bold tracking-tight text-snow transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2 group-hover:text-neon sm:text-3xl">
                            {t(`world.menu.items.${key}`)}
                          </span>
                          <span className="ml-auto translate-x-2 text-fog opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:text-neon group-hover:opacity-100">
                            →
                          </span>
                        </motion.button>
                      ))}
                    </nav>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, transition: { delay: 0.5, duration: 0.8 } }}
                      className="mt-auto flex items-center gap-3 pt-10"
                    >
                      <LogoMark size={26} />
                      <span className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-fog">
                        Goal-Oriented Academy
                      </span>
                    </motion.div>
                  </motion.aside>
                </>
              )}
            </AnimatePresence>

            {/* ---- reading panel ---- */}
            <AnimatePresence>
              {page && (
                <motion.section
                  key={page}
                  role="dialog"
                  aria-modal="true"
                  aria-label={t(`world.menu.items.${page}`)}
                  /* Lenis owns (and, while stopped, cancels) every wheel event
                     on the page — this attribute tells it to keep its hands
                     off events that start inside the panel, so the panel's
                     own overflow scrolling works natively. */
                  data-lenis-prevent
                  className="fixed inset-0 z-[82] overflow-y-auto overscroll-contain bg-void/95 backdrop-blur-xl"
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ duration: 0.65, ease: EASE }}
                >
                  <div className="sticky top-0 z-10 flex items-center justify-between bg-gradient-to-b from-void via-void/90 to-transparent px-6 py-5 sm:px-10">
                    <button
                      type="button"
                      onClick={() => setPage(null)}
                      className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-mist transition-colors duration-300 hover:text-neon"
                      {...cursorProps("button")}
                    >
                      <span aria-hidden="true">←</span> {t("world.menu.back")}
                    </button>
                    <CloseButton onClick={closeAll} label={t("world.menu.close")} />
                  </div>

                  <motion.div
                    initial={{ y: 32, opacity: 0 }}
                    animate={{ y: 0, opacity: 1, transition: { delay: 0.2, duration: 0.7, ease: EASE } }}
                    className="mx-auto max-w-3xl px-6 pb-28 pt-10 sm:px-8"
                  >
                    <PageContent page={page} />
                  </motion.div>
                </motion.section>
              )}
            </AnimatePresence>
          </>,
          document.body
        )}
    </>
  );
};

const CloseButton = ({ onClick, label }) => {
  const { cursorProps } = useCursor();
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="group relative grid h-10 w-10 place-items-center rounded-full border border-[color:var(--hairline)] text-mist transition-colors duration-300 hover:border-lime/40 hover:text-lime"
      {...cursorProps("button", label)}
    >
      <span className="relative block h-3.5 w-3.5">
        <span className="absolute left-0 top-1/2 h-px w-full rotate-45 bg-current transition-transform duration-500 group-hover:rotate-[135deg]" />
        <span className="absolute left-0 top-1/2 h-px w-full -rotate-45 bg-current transition-transform duration-500 group-hover:rotate-[45deg]" />
      </span>
    </button>
  );
};

/** The three destinations. Services reuses the full service catalogue from
 *  the locale files; Privacy/Terms render their titled sections. */
const PageContent = ({ page }) => {
  const { t } = useTranslation();

  if (page === "services") {
    const items = t("services.items", { returnObjects: true });
    return (
      <>
        <PageHeader
          eyebrow={t("world.menu.items.services")}
          title={t("world.pages.services.title")}
          note={t("world.pages.services.lead")}
        />
        <div className="mt-14 flex flex-col gap-12">
          {Array.isArray(items) &&
            items.map((s, i) => (
              <article key={i} className="border-l border-neon/25 pl-6">
                <div className="flex flex-wrap items-baseline gap-3">
                  <h3 className="font-display text-xl font-bold text-snow">{s.title}</h3>
                  <span className="rounded-full border border-lime/30 px-3 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-lime">
                    {s.tag}
                  </span>
                </div>
                <p className="mt-3 leading-relaxed text-mist">{s.blurb}</p>
                {Array.isArray(s.features) && (
                  <p className="mt-3 font-mono text-xs uppercase tracking-[0.2em] text-fog">
                    {s.features.join(" · ")}
                  </p>
                )}
              </article>
            ))}
        </div>
      </>
    );
  }

  const sections = t(`world.pages.${page}.sections`, { returnObjects: true });
  return (
    <>
      <PageHeader
        eyebrow={t("world.menu.items." + page)}
        title={t(`world.pages.${page}.title`)}
        note={t(`world.pages.${page}.updated`)}
      />
      <div className="mt-12 flex flex-col gap-10">
        {Array.isArray(sections) &&
          sections.map((s, i) => (
            <section key={i}>
              <h3 className="font-display text-lg font-bold text-snow">{s.h}</h3>
              <p className="mt-3 leading-relaxed text-mist">{s.p}</p>
            </section>
          ))}
      </div>
    </>
  );
};

const PageHeader = ({ eyebrow, title, note }) => (
  <header>
    <span className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.45em] text-neon">
      {eyebrow}
    </span>
    <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-snow sm:text-5xl">
      {title}
    </h2>
    {note && <p className="mt-4 text-fog">{note}</p>}
  </header>
);

export default WorldMenu;
