import { useScroll } from "../../hooks/useScroll.js";

/** ScrollProgress — thin neon bar pinned to the very top of the viewport. */
const ScrollProgress = () => {
  const { progress } = useScroll();
  return (
    <div className="fixed inset-x-0 top-0 z-[70] h-[2px] bg-transparent">
      <div
        className="h-full origin-left bg-gradient-to-r from-green via-lime to-neon shadow-[0_0_10px_rgba(125,255,158,0.6)]"
        style={{ transform: `scaleX(${progress})`, width: "100%" }}
      />
    </div>
  );
};

export default ScrollProgress;
