import { useLayoutEffect, useState } from "react";
import { useScroll, useTransform } from "framer-motion";

/**
 * useTvScroll — turns a pinned section's scroll progress into the motion
 * values that morph a fullscreen video into a physical TV. One scrubbed
 * progress feeds every transform, so the whole sequence is compositor-driven
 * and frame-perfect with the page scroll (Lenis eases the input for free).
 *
 * Progress is derived by hand from the page scrollY and the section's own
 * measured bounds — start = section top reaches the top of the viewport,
 * end = section bottom reaches the bottom of the viewport (the pinned length).
 * Measuring it ourselves (rather than useScroll's target+offset) keeps it
 * deterministic and correct even with the sticky child inside the section.
 *
 * Timeline (progress 0..1 over the pinned runway):
 *   0.00–0.10  fullscreen cinema — video fills the frame, playing
 *   0.10–0.60  the morph — video scales down, corners round, the bezel/frame
 *              forms, depth + shadow build, a slight tilt gives it volume
 *   0.60–0.85  the TV holds, fully formed
 *   0.85–1.00  released — the section hands scroll back to the page
 */
export function useTvScroll(sectionRef) {
  const { scrollY } = useScroll();
  const [bounds, setBounds] = useState({ start: 0, end: 1 });

  useLayoutEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const start = top; // section top at viewport top
      const end = top + rect.height - window.innerHeight; // section bottom at viewport bottom
      setBounds({ start, end: Math.max(end, start + 1) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [sectionRef]);

  // master progress 0..1 across the pinned length
  const p = useTransform(scrollY, [bounds.start, bounds.end], [0, 1], { clamp: true });

  // whole-unit scale: full-bleed → seated TV
  const scale = useTransform(p, [0.1, 0.6], [1, 0.62]);
  // subtle perspective tilt for volume, easing back to near-flat when seated
  const rotateX = useTransform(p, [0.1, 0.45, 0.7], [0, 7, 3]);
  const rotateY = useTransform(p, [0.1, 0.6], [0, -3]);

  // screen corner radius: sharp full-bleed → rounded panel
  const screenRadius = useTransform(p, [0.1, 0.55], [0, 20]);
  // bezel: grows from nothing around the screen
  const bezelPad = useTransform(p, [0.12, 0.6], [0, 20]);
  const bezelRadius = useTransform(p, [0.1, 0.55], [0, 30]);
  const bezelOpacity = useTransform(p, [0.12, 0.4], [0, 1]);

  // depth: shadow + glow build as the set lifts off the page
  const shadow = useTransform(
    p,
    [0.12, 0.6],
    [
      "0 0 0 rgba(0,0,0,0)",
      "0 60px 120px -30px rgba(0,0,0,0.85), 0 0 90px -20px var(--glow-color)",
    ]
  );

  // glassy screen sheen fades in with the frame
  const sheenOpacity = useTransform(p, [0.2, 0.5], [0, 1]);
  // stand + brand chrome appear once the panel is mostly formed
  const chromeOpacity = useTransform(p, [0.45, 0.62], [0, 1]);
  const standScaleY = useTransform(p, [0.45, 0.66], [0, 1]);

  // intro caption over the full-bleed cinema, gone before the morph
  const introOpacity = useTransform(p, [0, 0.06, 0.14], [1, 1, 0]);

  return {
    progress: p,
    scale,
    rotateX,
    rotateY,
    screenRadius,
    bezelPad,
    bezelRadius,
    bezelOpacity,
    shadow,
    sheenOpacity,
    chromeOpacity,
    standScaleY,
    introOpacity,
  };
}

export default useTvScroll;
