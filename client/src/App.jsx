import { AnimationProvider } from "./context/AnimationContext.jsx";
import { CursorProvider } from "./context/CursorContext.jsx";
import Cursor from "./components/cursor/Cursor.jsx";
import LoadingScreen from "./components/loaders/LoadingScreen.jsx";
import SmoothScroll from "./components/scroll/SmoothScroll.jsx";
import WorldExperience from "./world/WorldExperience.jsx";

/**
 * App — composition root of the GOA digital world.
 *
 * There are no pages and no routes: the site is one continuous scroll
 * journey (WorldExperience) wrapped in the few globals it needs — reduced
 * motion awareness, the bespoke cursor, Lenis inertial scrolling and the
 * once-per-session intro loader.
 */
const App = () => (
  <AnimationProvider>
    <CursorProvider>
      <SmoothScroll />
      <LoadingScreen />
      <Cursor />
      <WorldExperience />
    </CursorProvider>
  </AnimationProvider>
);

export default App;
