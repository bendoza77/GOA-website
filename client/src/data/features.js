import { useLocalized } from "../i18n/useLocalized.js";

/** "Why GOA" feature cards. `icon` maps to a lucide-react component name. */
const FEATURES_BASE = [
  { icon: "Code2" },
  { icon: "Users" },
  { icon: "Rocket" },
  { icon: "Terminal" },
  { icon: "GitBranch" },
  { icon: "Trophy" },
];

export const useFeatures = () => useLocalized(FEATURES_BASE, "features.items");
