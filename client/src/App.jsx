import { ThemeProvider } from "./context/ThemeContext.jsx";
import { AnimationProvider } from "./context/AnimationContext.jsx";
import { CursorProvider } from "./context/CursorContext.jsx";
import { NavigationProvider } from "./context/NavigationContext.jsx";
import Cursor from "./components/cursor/Cursor.jsx";
import LoadingScreen from "./components/loaders/LoadingScreen.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";

/**
 * App — composition root. Wires the context providers (theme, animation,
 * cursor, navigation) around the custom cursor, intro loader and router.
 * Router lives one level up in main.jsx so hooks like useLocation work here.
 */
const App = () => (
  <ThemeProvider>
    <AnimationProvider>
      <CursorProvider>
        <NavigationProvider>
          <LoadingScreen />
          <Cursor />
          <AppRoutes />
        </NavigationProvider>
      </CursorProvider>
    </AnimationProvider>
  </ThemeProvider>
);

export default App;
