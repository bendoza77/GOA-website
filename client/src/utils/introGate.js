/**
 * introGate — tiny pub/sub that tells the Hero when the intro LoadingScreen
 * has cleared, so its entrance animation plays in front of the user instead
 * of finishing hidden under the overlay.
 *
 * - First visit: LoadingScreen calls markIntroDone() as it starts its wipe.
 * - Refresh / return visit (loader skipped): marked immediately on mount.
 */
let done = false;
const subscribers = new Set();

export const isIntroDone = () => done;

export const markIntroDone = () => {
  if (done) return;
  done = true;
  subscribers.forEach((fn) => fn());
  subscribers.clear();
};

/** Runs fn once the intro is done (immediately if it already is).
 *  Returns an unsubscribe function. */
export const onIntroDone = (fn) => {
  if (done) {
    fn();
    return () => {};
  }
  subscribers.add(fn);
  return () => subscribers.delete(fn);
};
