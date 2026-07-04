import { useCursorContext } from "../context/CursorContext.jsx";

/** Convenience accessor for the custom cursor state + helpers. */
export function useCursor() {
  return useCursorContext();
}

export default useCursor;
