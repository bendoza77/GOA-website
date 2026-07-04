import { LogoMark } from "../ui/Logo.jsx";

/** SceneLoader — loading fallback shown while a Spline scene streams in. */
const SceneLoader = ({ label = "Rendering scene" }) => (
  <div className="absolute inset-0 grid place-items-center">
    <div className="flex flex-col items-center gap-4">
      <div className="relative grid place-items-center">
        <span className="absolute size-24 animate-spin-slow rounded-full border border-dashed border-lime/30" />
        <span className="absolute size-16 animate-[goa-spin-slow_9s_linear_infinite_reverse] rounded-full border border-neon/20" />
        <LogoMark size={40} className="animate-pulse-glow" />
      </div>
      <span className="font-mono text-xs tracking-[0.3em] text-fog">{label.toUpperCase()}</span>
    </div>
  </div>
);

export default SceneLoader;
