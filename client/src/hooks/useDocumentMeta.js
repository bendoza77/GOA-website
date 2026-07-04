import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { PAGE_META, TITLE_SUFFIX } from "../constants/site.js";

/**
 * useDocumentMeta — keeps the browser-tab <title> and <meta description> in
 * sync with the current route. Known paths use their configured title;
 * unmatched paths (rendered by the 404 route) fall back to the "/404" meta.
 * Home uses its full title verbatim; inner pages get "Page · Brand".
 */
export function useDocumentMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = PAGE_META[pathname] || PAGE_META["/404"];

    document.title =
      pathname === "/" ? meta.title : `${meta.title} · ${TITLE_SUFFIX}`;

    if (meta.description) {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", "description");
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", meta.description);
    }
  }, [pathname]);
}

export default useDocumentMeta;
