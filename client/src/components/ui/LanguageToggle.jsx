import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { LANGUAGES } from "../../i18n/index.js";
import { useCursor } from "../../hooks/useCursor.js";
import { cn } from "../../utils/cn.js";

/**
 * LanguageToggle — English ⇄ Georgian switch. Shows the code of the language
 * you'll switch TO; clicking flips the whole site's copy (i18next persists the
 * choice to localStorage and updates <html lang>). The label cross-fades on
 * change to echo the ThemeToggle's motion.
 */
const LanguageToggle = ({ className }) => {
  const { i18n, t } = useTranslation();
  const { cursorProps } = useCursor();

  const current = i18n.resolvedLanguage === "ka" ? "ka" : "en";
  const next = current === "en" ? "ka" : "en";
  const nextLang = LANGUAGES.find((l) => l.code === next);

  const switchLang = () => i18n.changeLanguage(next);

  return (
    <button
      type="button"
      onClick={switchLang}
      aria-label={`${t("lang.switch")}: ${nextLang.label}`}
      title={nextLang.label}
      className={cn(
        "group relative grid h-10 min-w-10 place-items-center overflow-hidden rounded-full border border-hairline bg-transparent px-3 text-mist transition-colors duration-300 hover:border-lime/40 hover:text-lime",
        className
      )}
      {...cursorProps("button", nextLang.short)}
    >
      <span className="pointer-events-none absolute inset-0 scale-0 rounded-full bg-lime/10 transition-transform duration-300 group-hover:scale-100" />
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={next}
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -12, opacity: 0 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="relative font-mono text-xs font-semibold tracking-wide"
        >
          {nextLang.short}
        </motion.span>
      </AnimatePresence>
    </button>
  );
};

export default LanguageToggle;
