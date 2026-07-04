/**
 * Accent map — translates a data-driven accent key ("green" | "lime" | "neon")
 * into consistent utility classes for icons, borders and glows.
 */
export const ACCENTS = {
  green: {
    text: "text-green",
    bg: "bg-green/10",
    border: "border-green/30",
    ring: "group-hover:border-green/50",
    gradient: "from-forest to-green",
    glow: "group-hover:shadow-[0_0_40px_-12px_rgba(47,191,95,0.6)]",
  },
  lime: {
    text: "text-lime",
    bg: "bg-lime/10",
    border: "border-lime/30",
    ring: "group-hover:border-lime/50",
    gradient: "from-green to-lime",
    glow: "group-hover:shadow-[0_0_40px_-12px_rgba(87,224,138,0.6)]",
  },
  neon: {
    text: "text-neon",
    bg: "bg-neon/10",
    border: "border-neon/30",
    ring: "group-hover:border-neon/50",
    gradient: "from-lime to-neon",
    glow: "group-hover:shadow-[0_0_40px_-12px_rgba(125,255,158,0.6)]",
  },
};

export const accent = (key = "green") => ACCENTS[key] || ACCENTS.green;
