import { motion } from "framer-motion";
import { SplineScene } from "@/components/ui/splite";
import { Card } from "@/components/ui/card";
import { Spotlight } from "@/components/ui/spotlight";
import Section from "../layout/Section.jsx";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import Icon from "../ui/Icon.jsx";
import FloatingObjects from "../3d/FloatingObjects.jsx";
import { viewportOnce } from "../../utils/motion.js";

/**
 * SplineRobotSection — GOA-branded take on the shadcn "Interactive 3D"
 * showcase. Combines <Card> + <Spotlight> (green fill) + the lazy <SplineScene>
 * robot. Left column carries the message; right column streams the 3D model
 * (with a <FloatingObjects> fallback if the scene can't load). Fully responsive:
 * stacks on mobile, side-by-side from md up.
 */
const ROBOT_SCENE = "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";

const SplineRobotSection = () => (
  <Section id="interactive-3d">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportOnce}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="relative w-full overflow-hidden border-lime/15 bg-black/[0.96]">
        <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" fill="#7dff9e" />
        <div className="absolute inset-0 bg-grid bg-grid-fade opacity-20" />

        <div className="relative flex min-h-[560px] flex-col md:flex-row">
          {/* Left — copy */}
          <div className="z-10 flex flex-1 flex-col justify-center gap-6 p-8 sm:p-12">
            <Badge dot pixel tone="neon" className="w-fit">
              Interactive 3D
            </Badge>
            <h2 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-transparent md:text-5xl bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text">
              Learning that feels alive
            </h2>
            <p className="max-w-lg text-neutral-300">
              Bring your UI to life with beautiful, interactive 3D scenes. At GOA
              you don't just watch tutorials — you build immersive experiences that
              capture attention and enhance your design. Drag the robot around.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Button to="/courses" size="lg" magnetic glow cursorLabel="Explore">
                Start building
                <Icon name="ArrowRight" className="size-4" />
              </Button>
              <span className="inline-flex items-center gap-2 font-mono text-xs text-neutral-400">
                <Icon name="Sparkles" className="size-4 text-lime" />
                Powered by Spline
              </span>
            </div>
          </div>

          {/* Right — interactive robot (lazy; falls back gracefully) */}
          <div className="relative min-h-[320px] flex-1">
            <SplineScene
              scene={ROBOT_SCENE}
              className="h-full w-full"
              fallback={<FloatingObjects />}
            />
          </div>
        </div>
      </Card>
    </motion.div>
  </Section>
);

export default SplineRobotSection;
