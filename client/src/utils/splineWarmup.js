/**
 * splineWarmup — pays the Spline robot's heaviest costs during idle time
 * instead of mid-scroll.
 *
 * First render of the robot normally stacks four main-thread hits at once:
 * download + parse of the multi-MB runtime chunk, the remote .splinecode
 * fetch, scene construction and shader compilation — right while the user
 * is scrolling toward the section. Warming the module (parse cost) and the
 * scene asset (HTTP cache) during a post-load idle window means the
 * near-viewport mount only pays scene build, and does so before the section
 * is on screen.
 *
 * Ordered last in the idle queue (route prefetch ≈ idle+4s, journey engine
 * ≈ idle+2.5s) so it never competes with lighter, higher-value work.
 */

let started = false;

/** True on devices that will render the CSS fallback anyway — don't spend
 *  megabytes warming a runtime that will never mount. */
export const isLowEndDevice = () =>
  navigator.connection?.saveData === true ||
  (navigator.deviceMemory !== undefined && navigator.deviceMemory <= 2);

export function warmSplineScene(sceneUrl) {
  if (started || typeof window === "undefined") return;
  started = true;
  if (isLowEndDevice()) return;

  const run = () => {
    /* 1. runtime chunk — import() shares the cache with React.lazy, so the
       later <Spline> mount resolves instantly with parse cost already paid */
    import("@splinetool/react-spline")
      .then(() => {
        /* 2. scene asset — a completed low-priority fetch lands the
           .splinecode in the HTTP cache; the runtime's own fetch of the
           same URL then reads from disk instead of the network */
        if (!sceneUrl) return;
        return fetch(sceneUrl, { priority: "low" }).then((r) => r.arrayBuffer());
      })
      .catch(() => {
        /* warmup is best-effort — a real mount will retry and surface errors */
      });
  };

  /* Wait out the busy post-load window, then take a genuine idle slot. */
  const schedule = () => {
    setTimeout(() => {
      if ("requestIdleCallback" in window) requestIdleCallback(run, { timeout: 8000 });
      else setTimeout(run, 1500);
    }, 4500);
  };

  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule, { once: true });
}

export default warmSplineScene;
