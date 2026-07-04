import { motion } from "framer-motion";
import { useMousePosition } from "../../hooks/useMousePosition.js";
import { useAnimationContext } from "../../context/AnimationContext.jsx";
import { LogoMark } from "../ui/Logo.jsx";
import Icon from "../ui/Icon.jsx";
import { cn } from "../../utils/cn.js";

/**
 * FloatingObjects — a self-contained, GPU-friendly "3D" ambience built from
 * CSS transforms + Framer Motion. Doubles as the graceful fallback for
 * <SplineScene>. Layers parallax to the pointer for depth.
 */

const CUBES = [
  { top: "8%", left: "12%", size: 64, depth: 1.4, delay: 0, icon: "Code2", accent: "text-lime" },
  { top: "20%", left: "78%", size: 52, depth: 1.9, delay: 0.4, icon: "Terminal", accent: "text-neon" },
  { top: "68%", left: "8%", size: 48, depth: 2.3, delay: 0.8, icon: "GitBranch", accent: "text-green" },
  { top: "74%", left: "72%", size: 68, depth: 1.2, delay: 0.2, icon: "Cpu", accent: "text-lime" },
  { top: "44%", left: "90%", size: 40, depth: 2.6, delay: 1, icon: "Zap", accent: "text-neon" },
  { top: "50%", left: "2%", size: 44, depth: 2, delay: 0.6, icon: "BrainCircuit", accent: "text-green" },
];

const FloatingObjects = ({ className }) => {
  const { animationsOn } = useAnimationContext();
  const { nx, ny } = useMousePosition({ disabled: !animationsOn });

  return (
    <div className={cn("perspective relative h-full w-full", className)} aria-hidden="true">
      {/* Ambient glow behind the core */}
      <div className="glow-orb left-1/2 top-1/2 size-[60%] -translate-x-1/2 -translate-y-1/2 opacity-60" />

      {/* Central rotating rings + brand core */}
      <motion.div
        className="preserve-3d absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ transform: `translate(-50%, -50%) rotateX(${ny * -8}deg) rotateY(${nx * 12}deg)` }}
      >
        <div className="relative grid size-56 place-items-center sm:size-72">
          <span className="absolute size-full animate-spin-slow rounded-full border border-dashed border-lime/25" />
          <span className="absolute size-3/4 animate-[goa-spin-slow_14s_linear_infinite_reverse] rounded-full border border-neon/20" />
          <span className="absolute size-1/2 rounded-full border border-green/20" />

          {/* Glass core */}
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="grid size-28 place-items-center rounded-3xl border border-lime/20 bg-gradient-to-br from-graphite/80 to-carbon/80 shadow-[0_0_60px_-12px_rgba(125,255,158,0.5)] backdrop-blur sm:size-36"
          >
            <LogoMark size={64} className="drop-shadow-[0_0_20px_rgba(125,255,158,0.6)]" />
          </motion.div>
        </div>
      </motion.div>

      {/* Orbiting pixel cubes with parallax depth */}
      {CUBES.map((c, i) => (
        <motion.div
          key={i}
          className="absolute grid place-items-center rounded-2xl border hairline bg-gradient-to-br from-graphite/90 to-carbon/70 shadow-xl backdrop-blur"
          style={{
            top: c.top,
            left: c.left,
            width: c.size,
            height: c.size,
            transform: `translate(${nx * c.depth * 14}px, ${ny * c.depth * 14}px)`,
          }}
          animate={{ y: [0, i % 2 ? 14 : -14, 0], rotate: [0, i % 2 ? 6 : -6, 0] }}
          transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: c.delay }}
        >
          <Icon name={c.icon} className={cn("size-1/2", c.accent)} strokeWidth={1.6} />
        </motion.div>
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
