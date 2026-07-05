import { useCursorActions } from "../context/CursorContext.jsx";

/**
 * Convenience accessor for the custom-cursor helpers (setCursor, resetCursor,
 * cursorProps). Returns the stable actions object only, so hoverable
 * components using it never re-render when the cursor state changes.
 */
export function useCursor() {
  return useCursorActions();
}

export default useCursor;
