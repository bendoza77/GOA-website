import { useLocalized } from "../i18n/useLocalized.js";

/**
 * Services catalogue. Structural fields (id, icon, accent) live here; the
 * translatable copy (title, tag, blurb, features) is merged from i18n by
 * position via useLocalized — keep the `services.items` array in en.json /
 * ka.json in the SAME ORDER as SERVICES_BASE (see i18n array-order convention).
 *
 * `icon` maps to a lucide name in the Icon registry; `accent` selects the
 * green/lime/neon accent scheme in utils/accents.js.
 */
const SERVICES_BASE = [
  { id: "mentorship", icon: "HeartHandshake", accent: "green" },
  { id: "bootcamps", icon: "GraduationCap", accent: "lime" },
  { id: "career", icon: "Target", accent: "neon" },
  { id: "review", icon: "GitPullRequest", accent: "green" },
  { id: "teams", icon: "Users", accent: "lime" },
  { id: "workshops", icon: "Mic", accent: "neon" },
];

/**
 * Delivery process — the four stages rendered in the signature 3D scroll
 * corridor (components/sections/ServiceProcess3D). Structural icon/accent
 * here; the step name + copy come from `servicesPage.process.steps` by index.
 */
const PROCESS_BASE = [
  { id: "discovery", icon: "Compass", accent: "green" },
  { id: "roadmap", icon: "Target", accent: "lime" },
  { id: "build", icon: "Hammer", accent: "neon" },
  { id: "launch", icon: "Rocket", accent: "green" },
];

export const useServices = () => useLocalized(SERVICES_BASE, "services.items");

export const useServiceProcess = () =>
  useLocalized(PROCESS_BASE, "servicesPage.process.steps");
