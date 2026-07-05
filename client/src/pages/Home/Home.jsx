import ScrollJourney from "../../components/3d/scroll/ScrollJourney.jsx";
import Hero from "../../components/sections/Hero.jsx";
import PartnersMarquee from "../../components/sections/PartnersMarquee.jsx";
import FeaturesSection from "../../components/sections/FeaturesSection.jsx";
import CoursesPreview from "../../components/sections/CoursesPreview.jsx";
import JourneySection from "../../components/sections/JourneySection.jsx";
import ImpactStats from "../../components/sections/ImpactStats.jsx";
import SplineRobotSection from "../../components/sections/SplineRobotSection.jsx";
import MentorsPreview from "../../components/sections/MentorsPreview.jsx";
import TestimonialsSection from "../../components/sections/TestimonialsSection.jsx";
import FAQSection from "../../components/sections/FAQSection.jsx";
import CTASection from "../../components/sections/CTASection.jsx";

/**
 * Home — the flagship page. Orchestrates the section components into the
 * full GOA narrative: hook → proof → offer → path → people → answers → act.
 */
const Home = () => (
  <>
    {/* Scroll-driven 3D story — fixed canvas behind all Home sections */}
    <ScrollJourney />
    <Hero />
    <PartnersMarquee />
    <FeaturesSection />
    <CoursesPreview />
    <JourneySection />
    <ImpactStats />
    <SplineRobotSection />
    <MentorsPreview />
    <TestimonialsSection />
    <FAQSection />
    <CTASection />
  </>
);

export default Home;
