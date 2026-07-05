import { lazy, Suspense, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import MainLayout from "../layouts/MainLayout.jsx";
import PageLoader from "../components/loaders/PageLoader.jsx";

/**
 * Route chunk loaders — single source of truth for code-splitting AND
 * prefetching. React.lazy consumes them for rendering; prefetchRoute /
 * prefetchAllRoutes warm the same chunks ahead of navigation so page
 * changes never hit the Suspense fallback (navigation feels instant).
 */
const ROUTE_LOADERS = {
  "/": () => import("../pages/Home/Home.jsx"),
  "/about": () => import("../pages/About/About.jsx"),
  "/courses": () => import("../pages/Courses/Courses.jsx"),
  "/mentors": () => import("../pages/Mentors/Mentors.jsx"),
  "/community": () => import("../pages/Community/Community.jsx"),
  "/events": () => import("../pages/Events/Events.jsx"),
  "/success-stories": () => import("../pages/SuccessStories/SuccessStories.jsx"),
  "/blog": () => import("../pages/Blog/Blog.jsx"),
  "/contact": () => import("../pages/Contact/Contact.jsx"),
};

const loadNotFound = () => import("../pages/NotFound/NotFound.jsx");

/** Warm a single route's chunk (e.g. on nav-link hover). Safe to call often —
 *  dynamic import() resolves from cache after the first call. */
export const prefetchRoute = (path) => {
  ROUTE_LOADERS[path]?.().catch(() => {
    /* prefetch is best-effort; a real navigation will retry and surface errors */
  });
};

/** Warm every route chunk during idle time after first paint. The chunks are
 *  tiny (1–6 kB gzipped), so this makes all navigations instant for the
 *  session at negligible cost. Skipped when the user asked to save data. */
export const prefetchAllRoutes = () => {
  if (navigator.connection?.saveData) return;
  const run = () => {
    Object.values(ROUTE_LOADERS)
      .reduce((chain, load) => chain.then(() => load().catch(() => {})), Promise.resolve())
      .then(() => loadNotFound().catch(() => {}));
  };
  if ("requestIdleCallback" in window) requestIdleCallback(run, { timeout: 4000 });
  else setTimeout(run, 2000);
};

const Home = lazy(ROUTE_LOADERS["/"]);
const About = lazy(ROUTE_LOADERS["/about"]);
const Courses = lazy(ROUTE_LOADERS["/courses"]);
const Mentors = lazy(ROUTE_LOADERS["/mentors"]);
const Community = lazy(ROUTE_LOADERS["/community"]);
const Events = lazy(ROUTE_LOADERS["/events"]);
const SuccessStories = lazy(ROUTE_LOADERS["/success-stories"]);
const Blog = lazy(ROUTE_LOADERS["/blog"]);
const Contact = lazy(ROUTE_LOADERS["/contact"]);
const NotFound = lazy(loadNotFound);

const AppRoutes = () => {
  useEffect(() => {
    prefetchAllRoutes();
  }, []);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/mentors" element={<Mentors />} />
          <Route path="/community" element={<Community />} />
          <Route path="/events" element={<Events />} />
          <Route path="/success-stories" element={<SuccessStories />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
