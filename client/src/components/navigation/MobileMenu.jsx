import { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { NAV_LINKS, SOCIALS } from "../../constants/site.js";
import { useNavigationContext } from "../../context/NavigationContext.jsx";
import { useLockBodyScroll } from "../../hooks/useLockBodyScroll.js";
import Button from "../ui/Button.jsx";
import Icon from "../ui/Icon.jsx";
import SocialIcon from "../ui/SocialIcon.jsx";
import ThemeToggle from "../ui/ThemeToggle.jsx";
import { cn } from "../../utils/cn.js";

const panel = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
  exit: { opacity: 0, transition: { duration: 0.25 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

/** MobileMenu — full-screen animated overlay for small screens. */
const MobileMenu = () => {
  const { isMenuOpen, closeMenu } = useNavigationContext();
  const { pathname } = useLocation();
  useLockBodyScroll(isMenuOpen);

  // Close on route change
  useEffect(() => {
    closeMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <AnimatePresence>
      {isMenuOpen && (
        <motion.div
          variants={panel}
          initial="hidden"
          animate="show"
          exit="exit"
          className="fixed inset-0 z-[60] flex flex-col bg-void/95 backdrop-blur-xl lg:hidden"
        >
          <div className="absolute inset-0 bg-grid bg-grid-fade opacity-30" />
          {/* Scrollable link list — pt clears the fixed header so links are
              never hidden behind it; my-auto keeps them centred when they fit. */}
          <div className="no-scrollbar relative flex flex-1 flex-col overflow-y-auto overscroll-contain px-8 pt-[calc(var(--nav-height)+2rem)] pb-4">
            <div className="my-auto flex w-full flex-col gap-1">
              {NAV_LINKS.map((link, i) => {
                const active = pathname === link.path;
                return (
                  <motion.div key={link.path} variants={item}>
                    <NavLink
                      to={link.path}
                      onClick={closeMenu}
                      className={cn(
                        "group flex items-center justify-between border-b border-slate-line py-3.5",
                        active ? "text-snow" : "text-fog"
                      )}
                    >
                      <span className="flex items-center gap-4">
                        <span className="font-mono text-xs text-lime/60">0{i + 1}</span>
                        <span className="font-display text-2xl font-semibold sm:text-3xl">{link.label}</span>
                      </span>
                      <Icon name="ArrowUpRight" className="size-5 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                    </NavLink>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <motion.div variants={item} className="relative flex flex-col gap-5 px-8 pb-10">
            <Button to="/contact" size="lg" glow className="w-full" onClick={closeMenu}>
              Apply now
            </Button>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label}
                    className="grid size-10 place-items-center rounded-full border border-slate-line text-fog transition-colors hover:border-lime/40 hover:text-lime"
                  >
                    <SocialIcon name={s.icon} className="size-4" />
                  </a>
                ))}
              </div>
              <ThemeToggle />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
