import { cn } from "../../utils/cn.js";

/**
 * LogoMark — the GOA pixel mark. Recreates the blocky, matrix-grid spirit of
 * the brand logo with an SVG pixel grid (a stylised "G"). Pure vector,
 * scales crisply, no asset load. The same pixel map drives the 3D cube
 * monument in the world engine (world/engine/gMark.js).
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

export default LogoMark;
