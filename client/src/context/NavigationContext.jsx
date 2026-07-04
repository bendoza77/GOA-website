import { createContext, useCallback, useContext, useMemo, useState } from "react";

/**
 * NavigationContext — shared UI state for the nav shell:
 * mobile menu open/close + the currently highlighted section id.
 */
const NavigationContext = createContext(null);

export const NavigationProvider = ({ children }) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const openMenu = useCallback(() => setMenuOpen(true), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const toggleMenu = useCallback(() => setMenuOpen((v) => !v), []);

  const value = useMemo(
    () => ({
      isMenuOpen,
      openMenu,
      closeMenu,
      toggleMenu,
      activeSection,
      setActiveSection,
    }),
    [isMenuOpen, openMenu, closeMenu, toggleMenu, activeSection]
  );

  return (
    <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>
  );
};

export const useNavigationContext = () => {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error("useNavigationContext must be used within <NavigationProvider>");
  return ctx;
};

export default NavigationContext;
