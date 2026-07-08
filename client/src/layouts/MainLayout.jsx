import { Suspense } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAnimationContext } from "../context/AnimationContext.jsx";
import { useRideComplete } from "../hooks/useRideComplete.js";
import PageLoader from "../components/loaders/PageLoader.jsx";
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
 * Home opens as a chrome-free pure-3D ride: scroll bar and footer stay out
 * of the frame until the ride completes, then join the step-by-step content
 * entrance (the navbar handles itself the same way).
 */
const MainLayout = () => {
  const location = useLocation();
  const outlet = useOutlet();
  const { animationsOn } = useAnimationContext();
  const rideDone = useRideComplete();
  useDocumentMeta();

  /* During Home's 3D ride: no chrome. Full chrome returns once the ride is
     over — and is always there when animations are off, because Home then
     renders its classic content page. */
  const cinematicHome =
    animationsOn && location.pathname === "/" && !rideDone;

  return (
    <div className="relative flex min-h-screen flex-col">
      <PageBackground />
      {!cinematicHome && <ScrollProgress />}
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
          {/* Inner boundary: if a route chunk ever isn't prefetched yet, only
              the page area falls back — navbar/footer/backdrop stay put. */}
          <Suspense fallback={<PageLoader />}>{outlet}</Suspense>
        </motion.main>
      </AnimatePresence>

      {!cinematicHome && <Footer />}
    </div>
  );
};

export default MainLayout;
