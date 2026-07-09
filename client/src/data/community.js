import { useLocalized } from "../i18n/useLocalized.js";

/** Structural bases — labels/descriptions are merged from i18n by position. */
const COMMUNITY_STATS_BASE = [
  { value: 45, suffix: "k" },
  { value: 180, suffix: "+" },
  { value: 60, suffix: "+" },
  { value: 24, suffix: "/7" },
];

const COMMUNITY_CHANNELS_BASE = [
  { icon: "MessagesSquare", name: "#help", accent: "green" },
  { icon: "Code2", name: "#code-review", accent: "lime" },
  { icon: "Briefcase", name: "#jobs", accent: "neon" },
  { icon: "Sparkles", name: "#showcase", accent: "green" },
  { icon: "Users", name: "#cohorts", accent: "lime" },
  { icon: "Mic", name: "#events", accent: "neon" },
];

export const useCommunityStats = () => useLocalized(COMMUNITY_STATS_BASE, "community.stats");
export const useCommunityChannels = () => useLocalized(COMMUNITY_CHANNELS_BASE, "community.channels");

/** Partner wordmarks — proper nouns, identical across languages. */
export const PARTNERS = [
  "Vercel", "Stripe", "Linear", "Notion", "Framer", "Shopify",
  "Datadog", "Cloudflare", "Scale", "Twilio", "Anthropic", "Duolingo",
];
