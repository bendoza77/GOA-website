import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Resets scroll position to the top on every route change. */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    // Through Lenis when it's driving the scroll, so a mid-glide momentum
    // animation can't fight the reset; native jump otherwise.
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true, force: true });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, [pathname]);
  return null;
};

export default ScrollToTop;
