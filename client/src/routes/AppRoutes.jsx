import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import MainLayout from "../layouts/MainLayout.jsx";
import PageLoader from "../components/loaders/PageLoader.jsx";

/* Code-split every page for fast first paint (React.lazy + Suspense). */
const Home = lazy(() => import("../pages/Home/Home.jsx"));
const About = lazy(() => import("../pages/About/About.jsx"));
const Courses = lazy(() => import("../pages/Courses/Courses.jsx"));
const Mentors = lazy(() => import("../pages/Mentors/Mentors.jsx"));
const Community = lazy(() => import("../pages/Community/Community.jsx"));
const Events = lazy(() => import("../pages/Events/Events.jsx"));
const SuccessStories = lazy(() => import("../pages/SuccessStories/SuccessStories.jsx"));
const Blog = lazy(() => import("../pages/Blog/Blog.jsx"));
const Contact = lazy(() => import("../pages/Contact/Contact.jsx"));
const NotFound = lazy(() => import("../pages/NotFound/NotFound.jsx"));

const AppRoutes = () => (
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

export default AppRoutes;
