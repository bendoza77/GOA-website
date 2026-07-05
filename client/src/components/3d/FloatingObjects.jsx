import { useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useAnimationContext } from "../../context/AnimationContext.jsx";
import { LogoMark } from "../ui/Logo.jsx";
import Icon from "../ui/Icon.jsx";
import { cn } from "../../utils/cn.js";

/**
 * FloatingObjects — a self-contained, GPU-friendly "3D" ambience built from
 * CSS transforms + Framer Motion. Doubles as the graceful fallback for
 * <SplineScene>. Layers parallax to the pointer for depth.
 *
 * Pointer parallax is wired through motion values, so mouse movement writes
 * transforms straight to the compositor — the component never re-renders.
 */

const CUBES = [
  { top: "8%", left: "12%", size: 64, depth: 1.4, delay: 0, icon: "Code2", accent: "text-lime" },
  { top: "20%", left: "78%", size: 52, depth: 1.9, delay: 0.4, icon: "Terminal", accent: "text-neon" },
  { top: "68%", left: "8%", size: 48, depth: 2.3, delay: 0.8, icon: "GitBranch", accent: "text-green" },
  { top: "74%", left: "72%", size: 68, depth: 1.2, delay: 0.2, icon: "Cpu", accent: "text-lime" },
  { top: "44%", left: "90%", size: 40, depth: 2.6, delay: 1, icon: "Zap", accent: "text-neon" },
  { top: "50%", left: "2%", size: 44, depth: 2, delay: 0.6, icon: "BrainCircuit", accent: "text-green" },
];

/** One orbiting cube: outer layer tracks pointer parallax (motion values),
 *  inner layer runs the infinite float/rotate loop as a CSS `goa-drift`
 *  animation — compositor-driven, free when off-screen, and the two
 *  transforms compose instead of fighting over one node. */
const FloatingCube = ({ cube, index, nx, ny }) => {
  const x = useTransform(nx, (v) => v * cube.depth * 14);
  const y = useTransform(ny, (v) => v * cube.depth * 14);

  return (
    <motion.div
      className="absolute"
      style={{ top: cube.top, left: cube.left, width: cube.size, height: cube.size, x, y }}
    >
      <div
        className="grid size-full place-items-center rounded-2xl border hairline bg-gradient-to-br from-graphite/90 to-carbon/70 shadow-xl backdrop-blur"
        style={{
          "--drift-y": `${index % 2 ? 14 : -14}px`,
          "--drift-r": `${index % 2 ? 6 : -6}deg`,
          animation: `goa-drift ${5 + index}s ease-in-out ${cube.delay}s infinite`,
        }}
      >
        <Icon name={cube.icon} className={cn("size-1/2", cube.accent)} strokeWidth={1.6} />
      </div>
    </motion.div>
  );
};

const FloatingObjects = ({ className }) => {
  const { animationsOn } = useAnimationContext();
  const nx = useMotionValue(0);
  const ny = useMotionValue(0);
  const rotateX = useTransform(ny, (v) => v * -8);
  const rotateY = useTransform(nx, (v) => v * 12);

  useEffect(() => {
    if (!animationsOn) return;
    const onMove = (e) => {
      nx.set((e.clientX / window.innerWidth) * 2 - 1);
      ny.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [animationsOn, nx, ny]);

  return (
    <div className={cn("perspective relative h-full w-full", className)} aria-hidden="true">
      {/* Ambient glow behind the core */}
      <div className="glow-orb left-1/2 top-1/2 size-[60%] -translate-x-1/2 -translate-y-1/2 opacity-60" />

      {/* Central rotating rings + brand core */}
      <motion.div
        className="preserve-3d absolute left-1/2 top-1/2"
        style={{ x: "-50%", y: "-50%", rotateX, rotateY }}
      >
        <div className="relative grid size-56 place-items-center sm:size-72">
          <span className="absolute size-full animate-spin-slow rounded-full border border-dashed border-lime/25" />
          <span className="absolute size-3/4 animate-[goa-spin-slow_14s_linear_infinite_reverse] rounded-full border border-neon/20" />
          <span className="absolute size-1/2 rounded-full border border-green/20" />

          {/* Glass core — bobs via compositor CSS, not a JS animation loop */}
          <div
            className="grid size-28 place-items-center rounded-3xl border border-lime/20 bg-gradient-to-br from-graphite/80 to-carbon/80 shadow-[0_0_60px_-12px_rgba(125,255,158,0.5)] backdrop-blur sm:size-36"
            style={{ "--drift-y": "-12px", animation: "goa-drift 6s ease-in-out infinite" }}
          >
            <LogoMark size={64} className="drop-shadow-[0_0_20px_rgba(125,255,158,0.6)]" />
          </div>
        </div>
      </motion.div>

      {/* Orbiting pixel cubes with parallax depth */}
      {CUBES.map((c, i) => (
        <FloatingCube key={i} cube={c} index={i} nx={nx} ny={ny} />
      ))}

      {/* Scattered pixels (nod to the logo mark) */}
      {[...Array(14)].map((_, i) => (
        <span
          key={`px-${i}`}
          className="absolute size-1.5 rounded-[2px] bg-lime/50 animate-float"
          style={{
            top: `${(i * 37) % 100}%`,
            left: `${(i * 53) % 100}%`,
            animationDelay: `${i * 0.3}s`,
            opacity: 0.3 + (i % 5) * 0.12,
          }}
        />
      ))}
    </div>
  );
};

export default FloatingObjects;
