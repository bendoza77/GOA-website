import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocalized } from "../i18n/useLocalized.js";

/**
 * Course catalogue. Structural fields (id, category key, accent, icon,
 * lessons, stack, price) live here; the translatable copy (title, level,
 * duration, tag, blurb) is merged from i18n by position. `category` is a
 * language-independent key so the catalogue filter keeps working in any
 * language.
 */
const COURSES_BASE = [
  { id: "frontend-architect", category: "frontend", lessons: 148, accent: "green", icon: "LayoutTemplate", stack: ["React", "Tailwind", "Framer Motion", "Vite"], price: "$1,490" },
  { id: "fullstack-engineer", category: "fullstack", lessons: 260, accent: "lime", icon: "Layers", stack: ["Node", "React", "Postgres", "Edge"], price: "$2,890" },
  { id: "ai-engineering", category: "ai", lessons: 96, accent: "neon", icon: "BrainCircuit", stack: ["LLMs", "RAG", "Agents", "Vector DB"], price: "$1,990" },
  { id: "cloud-devops", category: "cloud", lessons: 120, accent: "green", icon: "Cloud", stack: ["Docker", "K8s", "Terraform", "CI/CD"], price: "$1,690" },
  { id: "mobile-react-native", category: "mobile", lessons: 104, accent: "lime", icon: "Smartphone", stack: ["Expo", "React Native", "Reanimated"], price: "$1,490" },
  { id: "data-structures", category: "interview", lessons: 72, accent: "neon", icon: "Binary", stack: ["Algorithms", "System Design", "Mock"], price: "$990" },
];

/** Category keys — labels are pulled from i18n (`courses.categories.<key>`). */
export const COURSE_CATEGORY_KEYS = ["all", "frontend", "fullstack", "ai", "cloud", "mobile", "interview"];

/** Pricing plans — only `featured` is structural. */
const PLANS_BASE = [{}, { featured: true }, {}];

export const useCourses = () => useLocalized(COURSES_BASE, "courses.items");

export const useCourseCategories = () => {
  const { t } = useTranslation();
  return useMemo(
    () => COURSE_CATEGORY_KEYS.map((key) => ({ key, label: t(`courses.categories.${key}`) })),
    [t]
  );
};

export const usePlans = () => useLocalized(PLANS_BASE, "plans");
