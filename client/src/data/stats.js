import { useLocalized } from "../i18n/useLocalized.js";

/** Headline metrics used in the hero + stats band. Labels come from i18n. */
const HERO_STATS_BASE = [
  { value: 12000, suffix: "+" },
  { value: 94, suffix: "%" },
  { value: 320, suffix: "+" },
  { value: 4.9, suffix: "/5", decimals: 1 },
];

const IMPACT_STATS_BASE = [
  { value: 68, suffix: "%" },
  { value: 180, suffix: "+" },
  { value: 45, suffix: "k" },
  { value: 24, suffix: "/7" },
];

export const useHeroStats = () => useLocalized(HERO_STATS_BASE, "stats.hero");
export const useImpactStats = () => useLocalized(IMPACT_STATS_BASE, "stats.impact");
