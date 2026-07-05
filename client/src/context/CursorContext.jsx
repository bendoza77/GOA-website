import { createContext, useContext, useMemo, useState } from "react";

/**
 * CursorContext — lets any component request a cursor "variant"
 * (e.g. hover a button → grow the ring, show a label).
 * The visual is rendered once by <Cursor /> which subscribes here.
 *
 * Split into two contexts so the frequently-changing state (variant/label)
 * only re-renders <Cursor />, while the hundreds of hoverable elements
 * subscribe to a stable actions object and never re-render on hover.
 */
const CursorStateContext = createContext(null);
const CursorActionsContext = createContext(null);

export const CursorProvider = ({ children }) => {
  const [state, setState] = useState({ variant: "default", label: "" });

  const actions = useMemo(() => {
    const setCursor = (nextVariant = "default", nextLabel = "") =>
      setState({ variant: nextVariant, label: nextLabel });
    const resetCursor = () => setState({ variant: "default", label: "" });
    /** Spread onto any element to drive the cursor on hover. */
    const cursorProps = (nextVariant = "hover", nextLabel = "") => ({
      onMouseEnter: () => setCursor(nextVariant, nextLabel),
      onMouseLeave: resetCursor,
    });
    return { setCursor, resetCursor, cursorProps };
  }, []);

  return (
    <CursorActionsContext.Provider value={actions}>
      <CursorStateContext.Provider value={state}>{children}</CursorStateContext.Provider>
    </CursorActionsContext.Provider>
  );
};

/** Stable helpers only — safe for buttons/links; never re-renders on hover. */
export const useCursorActions = () => {
  const ctx = useContext(CursorActionsContext);
  if (!ctx) throw new Error("useCursorActions must be used within <CursorProvider>");
  return ctx;
};

/** Full state + helpers — for the <Cursor /> visual itself. */
export const useCursorContext = () => {
  const state = useContext(CursorStateContext);
  const actions = useCursorActions();
  if (!state) throw new Error("useCursorContext must be used within <CursorProvider>");
  return useMemo(() => ({ ...state, ...actions }), [state, actions]);
};

export default CursorStateContext;
