import { useLocalized } from "../i18n/useLocalized.js";

/**
 * Student testimonials for the social-proof marquee + stories page. Names are
 * proper nouns; quote and role are merged from i18n by position.
 */
const TESTIMONIALS_BASE = [
  { id: 1, name: "Priya Shah", initials: "PS", accent: "green" },
  { id: 2, name: "Tom Becker", initials: "TB", accent: "lime" },
  { id: 3, name: "Yuki Tanaka", initials: "YT", accent: "neon" },
  { id: 4, name: "Grace Miller", initials: "GM", accent: "green" },
  { id: 5, name: "Andre Costa", initials: "AC", accent: "lime" },
  { id: 6, name: "Fatima Noor", initials: "FN", accent: "neon" },
];

export const useTestimonials = () => useLocalized(TESTIMONIALS_BASE, "testimonials.items");
