import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ROUTE_META_KEYS, TITLE_SUFFIX } from "../constants/site.js";

/**
 * useDocumentMeta — keeps the browser-tab <title> and <meta description> in
 * sync with the current route AND the active language. Known paths use their
 * configured meta; unmatched paths (the 404 route) fall back to "notFound".
 * Home uses its full title verbatim; inner pages get "Page · Brand".
 */
export function useDocumentMeta() {
  const { pathname } = useLocation();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const key = ROUTE_META_KEYS[pathname] || "notFound";
    const title = t(`meta.${key}.title`);
    const description = t(`meta.${key}.description`);

    document.title = pathname === "/" ? title : `${title} · ${TITLE_SUFFIX}`;

    if (description) {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", "description");
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", description);
    }
  }, [pathname, t, i18n.language]);
}

export default useDocumentMeta;
