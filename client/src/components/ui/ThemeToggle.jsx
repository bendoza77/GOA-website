import { AnimatePresence, motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../hooks/useTheme.js";
import { useCursor } from "../../hooks/useCursor.js";
import { cn } from "../../utils/cn.js";

/**
 * ThemeToggle — animated light/dark switch. The icon cross-fades + rotates
 * between sun and moon; the whole control adopts the theme's accent on hover.
 */
const ThemeToggle = ({ className }) => {
  const { isDark, toggleTheme } = useTheme();
  const { cursorProps } = useCursor();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={cn(
        "group relative grid size-10 place-items-center overflow-hidden rounded-full border border-hairline bg-transparent text-mist transition-colors duration-300 hover:border-lime/40 hover:text-lime",
        className
      )}
      {...cursorProps("button", isDark ? "Light" : "Dark")}
    >
      {/* soft accent wash on hover */}
      <span className="pointer-events-none absolute inset-0 scale-0 rounded-full bg-lime/10 transition-transform duration-300 group-hover:scale-100" />
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={{ y: 14, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -14, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          {isDark ? <Moon className="size-[1.15rem]" strokeWidth={2} /> : <Sun className="size-[1.15rem]" strokeWidth={2} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
};

export default ThemeToggle;
