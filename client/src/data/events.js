import { useLocalized } from "../i18n/useLocalized.js";

/**
 * Events. `day` and `accent` are structural; `month` (abbreviated) and all
 * copy are merged from i18n by position, so the date block reads naturally
 * in every language (e.g. "ივლ 18").
 */
const EVENTS_BASE = [
  { id: "react-summit", day: "18", accent: "green" },
  { id: "ai-night", day: "25", accent: "neon" },
  { id: "career-fair", day: "02", accent: "lime" },
  { id: "design-jam", day: "09", accent: "green" },
  { id: "devops-lab", day: "16", accent: "lime" },
  { id: "alumni-mixer", day: "23", accent: "neon" },
];

export const useEvents = () => useLocalized(EVENTS_BASE, "events.items");
