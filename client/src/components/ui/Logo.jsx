import { Link } from "react-router-dom";
import { cn } from "../../utils/cn.js";

/**
 * Logo — GOA pixel mark + wordmark.
 * The mark recreates the blocky, matrix-grid spirit of the brand logo with an
 * SVG pixel grid (a stylised "G"). Pure vector, scales crisply, no asset load.
 */

// 6x6 pixel map for a blocky "G". 1 = filled.
const G_PIXELS = [
  [0, 1, 1, 1, 1, 0],
  [1, 1, 0, 0, 0, 0],
  [1, 1, 0, 1, 1, 1],
  [1, 1, 0, 0, 1, 1],
  [1, 1, 0, 0, 1, 1],
  [0, 1, 1, 1, 1, 0],
];

export const LogoMark = ({ className, size = 34 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={cn("shrink-0", className)}
    role="img"
    aria-label="GOA"
  >
    <defs>
      <linearGradient id="goa-mark" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#57e08a" />
        <stop offset="1" stopColor="#7dff9e" />
      </linearGradient>
    </defs>
    <rect x="0.5" y="0.5" width="23" height="23" rx="6" fill="#0a110c" stroke="rgba(125,255,158,0.25)" />
    {G_PIXELS.flatMap((row, r) =>
      row.map((on, c) =>
        on ? (
          <rect
            key={`${r}-${c}`}
            x={4 + c * 2.7}
            y={4 + r * 2.7}
            width={2.2}
            height={2.2}
            rx={0.4}
            fill="url(#goa-mark)"
          />
        ) : null
      )
    )}
  </svg>
);

const Logo = ({ className, showText = true, size = 34, onClick }) => (
  <Link
    to="/"
    onClick={onClick}
    aria-label="Goal-Oriented Academy — home"
    className={cn(
      "group inline-flex items-center gap-2.5 font-display font-bold tracking-tight",
      className
    )}
  >
    <span className="relative grid place-items-center transition-transform duration-500 group-hover:rotate-6">
      <LogoMark size={size} className="drop-shadow-[0_0_12px_rgba(125,255,158,0.35)]" />
    </span>
    {showText && (
      <span className="text-lg leading-none">
        <span className="text-snow">GOA</span>
        <span className="ml-1 hidden text-fog font-mono text-[0.6rem] font-normal tracking-[0.2em] sm:inline">
          ACADEMY
        </span>
      </span>
    )}
  </Link>
);

export default Logo;
