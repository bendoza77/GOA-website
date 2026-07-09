import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocalized } from "../i18n/useLocalized.js";

/**
 * Blog posts. `category` is a language-independent key used for filtering;
 * the displayed category label, title, date, read-time and excerpt come from
 * i18n by position. `author` is a proper noun, kept as-is.
 */
const BLOG_POSTS_BASE = [
  { id: "react-19-view-transitions", category: "engineering", accent: "green", author: "Aria Nova" },
  { id: "learn-by-building", category: "learning", accent: "lime", author: "Sana Riel" },
  { id: "rag-in-production", category: "ai", accent: "neon", author: "Lena Koto" },
  { id: "design-systems-scale", category: "design", accent: "green", author: "Aria Nova" },
  { id: "cracking-system-design", category: "career", accent: "lime", author: "Marcus Vale" },
  { id: "edge-first", category: "engineering", accent: "neon", author: "Diego Ferro" },
];

export const BLOG_CATEGORY_KEYS = ["all", "engineering", "learning", "ai", "design", "career"];

export const useBlogPosts = () => useLocalized(BLOG_POSTS_BASE, "blog.posts");

export const useBlogCategories = () => {
  const { t } = useTranslation();
  return useMemo(
    () => BLOG_CATEGORY_KEYS.map((key) => ({ key, label: t(`blog.categories.${key}`) })),
    [t]
  );
};
