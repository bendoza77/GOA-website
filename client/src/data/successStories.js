import { useLocalized } from "../i18n/useLocalized.js";

/**
 * Success stories. Names, initials, salary delta and months are structural;
 * before/after/quote/track are merged from i18n by position.
 */
const SUCCESS_STORIES_BASE = [
  { id: "priya", name: "Priya Shah", initials: "PS", accent: "green", salary: "+72%", months: 5 },
  { id: "tom", name: "Tom Becker", initials: "TB", accent: "lime", salary: "+118%", months: 8 },
  { id: "yuki", name: "Yuki Tanaka", initials: "YT", accent: "neon", salary: "+64%", months: 4 },
  { id: "grace", name: "Grace Miller", initials: "GM", accent: "green", salary: "+40%", months: 3 },
];

export const useSuccessStories = () => useLocalized(SUCCESS_STORIES_BASE, "stories.items");
