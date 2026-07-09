import { useLocalized } from "../i18n/useLocalized.js";

/** The learner journey — powers the animated timeline on About/Home. */
const JOURNEY_BASE = [
  { step: "01", icon: "Compass" },
  { step: "02", icon: "Hammer" },
  { step: "03", icon: "GitPullRequest" },
  { step: "04", icon: "Users" },
  { step: "05", icon: "Trophy" },
];

/** GOA values — About page. */
const VALUES_BASE = [
  { icon: "Target" },
  { icon: "Sparkles" },
  { icon: "HeartHandshake" },
  { icon: "Globe" },
];

export const useJourney = () => useLocalized(JOURNEY_BASE, "journey.items");
export const useValues = () => useLocalized(VALUES_BASE, "about.values.items");
