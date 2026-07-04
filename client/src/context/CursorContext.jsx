import { createContext, useCallback, useContext, useMemo, useState } from "react";

/**
 * CursorContext — lets any component request a cursor "variant"
 * (e.g. hover a button → grow the ring, show a label).
 * The visual is rendered once by <Cursor /> which subscribes here.
 */
const CursorContext = createContext(null);

export const CursorProvider = ({ children }) => {
  const [variant, setVariant] = useState("default");
  const [label, setLabel] = useState("");

  const setCursor = useCallback((nextVariant = "default", nextLabel = "") => {
    setVariant(nextVariant);
    setLabel(nextLabel);
  }, []);

  const resetCursor = useCallback(() => {
    setVariant("default");
    setLabel("");
  }, []);

  /** Spread onto any element to drive the cursor on hover. */
  const cursorProps = useCallback(
    (nextVariant = "hover", nextLabel = "") => ({
      onMouseEnter: () => setCursor(nextVariant, nextLabel),
      onMouseLeave: resetCursor,
    }),
    [setCursor, resetCursor]
  );

  const value = useMemo(
    () => ({ variant, label, setCursor, resetCursor, cursorProps }),
    [variant, label, setCursor, resetCursor, cursorProps]
  );

  return <CursorContext.Provider value={value}>{children}</CursorContext.Provider>;
};

export const useCursorContext = () => {
  const ctx = useContext(CursorContext);
  if (!ctx) throw new Error("useCursorContext must be used within <CursorProvider>");
  return ctx;
};

export default CursorContext;
