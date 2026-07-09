import { useLocalized } from "../i18n/useLocalized.js";

/**
 * Mentor roster. Names and companies are proper nouns (kept as-is); role,
 * focus and bio are merged from i18n by position.
 */
const MENTORS_BASE = [
  { id: "aria-nova", name: "Aria Nova", company: "Vercel", initials: "AN", accent: "green" },
  { id: "marcus-vale", name: "Marcus Vale", company: "Stripe", initials: "MV", accent: "lime" },
  { id: "lena-koto", name: "Lena Koto", company: "Anthropic", initials: "LK", accent: "neon" },
  { id: "diego-ferro", name: "Diego Ferro", company: "Cloudflare", initials: "DF", accent: "green" },
  { id: "sana-riel", name: "Sana Riel", company: "Linear", initials: "SR", accent: "lime" },
  { id: "omar-blaze", name: "Omar Blaze", company: "Framer", initials: "OB", accent: "neon" },
];

export const useMentors = () => useLocalized(MENTORS_BASE, "mentorsData.items");
