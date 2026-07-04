import { LogoMark } from "../ui/Logo.jsx";

/** PageLoader — Suspense fallback shown while a lazy route chunk loads. */
const PageLoader = () => (
  <div className="grid min-h-[70vh] place-items-center">
    <div className="flex flex-col items-center gap-4">
      <LogoMark size={48} className="animate-float drop-shadow-[0_0_20px_rgba(125,255,158,0.4)]" />
      <div className="h-[3px] w-32 overflow-hidden rounded-full bg-graphite">
        <div className="h-full w-1/2 animate-[goa-marquee_1s_linear_infinite] bg-gradient-to-r from-green to-neon" />
      </div>
      <span className="font-mono text-xs tracking-[0.3em] text-fog">LOADING</span>
    </div>
  </div>
);

export default PageLoader;
