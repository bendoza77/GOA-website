import { useState } from "react";
import { wasRideSeen } from "../../utils/rideGate.js";
import ScrollJourney from "../../components/3d/scroll/ScrollJourney.jsx";
import CubeStage from "../../components/3d/cube/CubeStage.jsx";
import DepthDust from "../../components/backgrounds/DepthDust.jsx";
import CinematicIntro from "../../components/sections/CinematicIntro.jsx";
import Hero from "../../components/sections/Hero.jsx";
import VideoSection from "../../components/sections/CinematicVideo/VideoSection.jsx";
import PartnersMarquee from "../../components/sections/PartnersMarquee.jsx";
import FeaturesSection from "../../components/sections/FeaturesSection.jsx";
import CoursesPreview from "../../components/sections/CoursesPreview.jsx";
import JourneySection from "../../components/sections/JourneySection.jsx";
import ImpactStats from "../../components/sections/ImpactStats.jsx";
import MentorsPreview from "../../components/sections/MentorsPreview.jsx";
import TestimonialsSection from "../../components/sections/TestimonialsSection.jsx";
import FAQSection from "../../components/sections/FAQSection.jsx";
import CTASection from "../../components/sections/CTASection.jsx";
import RobotShowcase from "../../components/sections/RobotShowcase.jsx";

/**
 * Home — two acts.
 *
 * Act one: the pure-3D ride. CinematicIntro's 700vh runway drives the whole
 * scroll-journey story (laptop → portal → AI core → pathway → pixel-G →
 * exit gate) with zero chrome in the frame — navbar, scroll bar and footer
 * hold off until the ride completes (see useRideComplete).
 *
 * Act two: the story ends and the page renders step-by-step — header slides
 * in, hero copy rises, then every section reveals in sequence on the way
 * down, closing with the footer.
 *
 * With animations off, the 3D pieces remove themselves (each self-gates on
 * AnimationContext) and Home is simply the classic content page.
 *
 * Return visits within the session skip the ride entirely (rideGate): the
 * intro runways are dropped and the cube renders already docked in the hero,
 * so navigating away and back lands straight on the content instead of making
 * the visitor scroll the whole opening again.
 */
const Home = () => {
  // Captured once at mount so the runways can't unmount mid-ride when the
  // flag flips to seen — the branch is fixed for this visit.
  const [replay] = useState(wasRideSeen);

  return (
  <>
    {!replay && <ScrollJourney />}
    <DepthDust />
    {!replay && <CinematicIntro />}
    {/* Act two: the hero cube falls in, reveals every side, then flies into
        the Hero's reserved slot and docks (CubeStage owns its own scroll
        runway, so it slots cleanly between the ride and the hero). On a return
        visit it skips straight to the docked pose. */}
    <CubeStage docked={replay} />
    <Hero />
    {/* Cinematic act: fullscreen video that morphs into a physical TV. */}
    <VideoSection />
    <PartnersMarquee />
    <FeaturesSection />
    <CoursesPreview />
    <JourneySection />
    <ImpactStats />
    <MentorsPreview />
    <TestimonialsSection />
    <FAQSection />
    <CTASection />
    {/* Interactive 3D finale — the draggable robot, at the very bottom of Home */}
    <RobotShowcase />
  </>
  );
};

export default Home;
