import { motion } from "framer-motion";
import Button from "../../components/ui/Button.jsx";
import Icon from "../../components/ui/Icon.jsx";
import ParticleField from "../../components/backgrounds/ParticleField.jsx";
import AnimatedGrid from "../../components/backgrounds/AnimatedGrid.jsx";

/** NotFound — playful, on-brand 404 with a glitchy pixel wordmark. */
const NotFound = () => (
  <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
    <AnimatedGrid perspective />
    <ParticleField className="opacity-60" />

    <div className="relative flex flex-col items-center text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
      >
        <h1 className="font-display text-[28vw] font-bold leading-none text-transparent sm:text-[16rem]" style={{ WebkitTextStroke: "1.5px var(--edge-glow)" }}>
          404
        </h1>
        <span className="pointer-events-none absolute inset-0 grid place-items-center font-display text-[28vw] font-bold leading-none text-gradient-green opacity-90 sm:text-[16rem] animate-blink">
          404
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="-mt-4 flex flex-col items-center gap-6"
      >
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-lime">Signal lost</p>
        <h2 className="h2 max-w-lg text-balance">This route never compiled</h2>
        <p className="lead max-w-md">
          The page you're after moved, shipped, or never existed. Let's get you back to solid ground.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button to="/" size="lg" magnetic glow cursorLabel="Home">
            <Icon name="ArrowLeft" className="size-4" />
            Back home
          </Button>
          <Button to="/courses" size="lg" variant="secondary">
            Browse courses
          </Button>
        </div>
      </motion.div>
    </div>
  </section>
);

export default NotFound;
