import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { NAV_LINKS } from "../../constants/site.js";
import { useScroll } from "../../hooks/useScroll.js";
import { useNavigationContext } from "../../context/NavigationContext.jsx";
import { cn } from "../../utils/cn.js";
import Logo from "../ui/Logo.jsx";
import Button from "../ui/Button.jsx";
import Icon from "../ui/Icon.jsx";
import ThemeToggle from "../ui/ThemeToggle.jsx";
import MobileMenu from "./MobileMenu.jsx";

/**
 * Navbar — floating glass header. Transparent at the top of the page, then
 * fades into a blurred bar on scroll. Active route gets a shared-layout pill.
 */
const Navbar = () => {
  const { scrolled } = useScroll(20);
  const { isMenuOpen, toggleMenu } = useNavigationContext();
  const { pathname } = useLocation();

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[65] flex justify-center px-4 pt-3 sm:pt-4">
        <motion.nav
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "flex w-full max-w-6xl items-center justify-between gap-4 rounded-full px-4 py-2.5 transition-all duration-500 sm:px-5",
            scrolled
              ? "glass hairline shadow-[0_10px_40px_-20px_rgba(0,0,0,0.35)]"
              : "border-transparent bg-transparent"
          )}
        >
          <Logo />

          {/* Desktop links */}
          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.path;
              return (
                <li key={link.path}>
                  <NavLink
                    to={link.path}
                    className={cn(
                      "relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-200",
                      active ? "text-snow" : "text-fog hover:text-mist"
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full border border-lime/20 surface-3"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{link.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button to="/contact" size="sm" magnetic glow cursorLabel="Apply" className="hidden sm:inline-flex">
              Apply now
            </Button>
            {/* Mobile toggle */}
            <button
              onClick={toggleMenu}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              className="grid size-10 place-items-center rounded-full border hairline surface-2 text-snow transition-colors hover:border-lime/40 lg:hidden"
            >
              <Icon name={isMenuOpen ? "X" : "Menu"} className="size-5" />
            </button>
          </div>
        </motion.nav>
      </header>

      <MobileMenu />
    </>
  );
};

export default Navbar;
