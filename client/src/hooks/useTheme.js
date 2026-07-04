import { useThemeContext } from "../context/ThemeContext.jsx";

/** Thin hook wrapper so components import from /hooks consistently. */
export function useTheme() {
  return useThemeContext();
}

export default useTheme;
