/**
 * rideGate — session-scoped memory of whether Home's chrome-free 3D opening
 * (the scroll-journey ride + hero-cube act) has already played this tab.
 *
 * The ride is a first-impression treat, not something to sit through again:
 * once the visitor has scrolled past it, navigating to another page and back
 * to Home should land straight on the content (cube already docked in the
 * hero), with the navbar/footer/scroll bar present from the first frame.
 *
 * Backed by sessionStorage so a hard reload replays it (a fresh session), but
 * client-side navigation within the tab does not. A tiny pub/sub lets the
 * shell (MainLayout, Navbar) react the moment the ride completes.
 */
const SESSION_KEY = "goa-ride-seen";

const read = () => {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
};

let seen = read();
const subscribers = new Set();

/** True once the ride has been watched to completion this session. */
export const wasRideSeen = () => seen;

/** Record that the ride has played; notifies subscribers exactly once. */
export const markRideSeen = () => {
  if (seen) return;
  seen = true;
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    /* private mode — the ride will simply replay on the next navigation */
  }
  subscribers.forEach((fn) => fn());
};

/** Subscribe to the ride-seen transition. Returns an unsubscribe function. */
export const onRideSeen = (fn) => {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
};
