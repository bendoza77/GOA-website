import { useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "../components/navigation/Navbar.jsx";
import Footer from "../components/layout/Footer.jsx";
import ScrollProgress from "../components/navigation/ScrollProgress.jsx";
import ScrollToTop from "../components/layout/ScrollToTop.jsx";
import PageBackground from "../components/backgrounds/PageBackground.jsx";
import { useDocumentMeta } from "../hooks/useDocumentMeta.js";
import { pageTransition } from "../utils/motion.js";

/**
 * MainLayout — the persistent app shell: fixed brand backdrop, scroll bar,
 * glass navbar and footer wrap an animated <Outlet> so routes cross-fade.
 */
const MainLayout = () => {
  const location = useLocation();
  const outlet = useOutlet();
  useDocumentMeta();

  return (
    <div className="relative flex min-h-screen flex-col">
      <PageBackground />
      <ScrollProgress />
      <ScrollToTop />
      <Navbar />

      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={location.pathname}
          initial={pageTransition.initial}
          animate={pageTransition.animate}
          exit={pageTransition.exit}
          className="flex-1"
        >
          {outlet}
        </motion.main>
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default MainLayout;
