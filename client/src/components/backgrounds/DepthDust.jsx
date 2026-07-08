import { useAnimationContext } from "../../context/AnimationContext.jsx";

/**
 * DepthDust — the foreground half of the depth sandwich. A handful of large,
 * heavily-blurred motes drift slowly IN FRONT of the page content
 * (scene behind → UI between → dust in front), which is what makes the UI
 * read as suspended inside the 3D world instead of sitting on top of it.
 *
 * Deliberately whisper-quiet: few elements, very low opacity, compositor-only
 * animation (the shared goa-drift transform keyframes), zero re-renders and
 * pointer-events-none so it can never intercept a click. Sits below the
 * navbar (z-65) so chrome stays crisp.
 */

/* Deterministic layout — tuned by hand so no mote parks over the headline
   or primary CTAs. size in px; dur in s. */
const MOTES = [
  { top: "16%", left: "6%", size: 10, blur: 3, dur: 11, delay: 0, drift: -26 },
  { top: "30%", left: "88%", size: 16, blur: 5, dur: 14, delay: 1.6, drift: 30 },
  { top: "58%", left: "12%", size: 7, blur: 2, dur: 9, delay: 0.8, drift: -18 },
  { top: "72%", left: "82%", size: 12, blur: 4, dur: 12, delay: 2.4, drift: 24 },
  { top: "44%", left: "48%", size: 20, blur: 7, dur: 16, delay: 1.1, drift: -34 },
  { top: "86%", left: "38%", size: 8, blur: 3, dur: 10, delay: 0.4, drift: 20 },
  { top: "8%", left: "64%", size: 6, blur: 2, dur: 8, delay: 2.0, drift: -14 },
  { top: "64%", left: "58%", size: 14, blur: 6, dur: 15, delay: 3.1, drift: 28 },
];

const DepthDust = () => {
  const { animationsOn } = useAnimationContext();
  if (!animationsOn) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[15]"
    >
      {MOTES.map((m, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            top: m.top,
            left: m.left,
            width: m.size,
            height: m.size,
            background:
              i % 3 === 0 ? "var(--color-neon)" : "var(--color-lime)",
            opacity: 0.05 + (m.size / 20) * 0.06,
            filter: `blur(${m.blur}px)`,
            "--drift-y": `${m.drift}px`,
            animation: `goa-drift ${m.dur}s ease-in-out ${m.delay}s infinite`,
            willChange: "transform",
          }}
        />
      ))}
    </div>
  );
};

export default DepthDust;
