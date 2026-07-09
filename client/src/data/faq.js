import { useMemo } from "react";
import { useTranslation } from "react-i18next";

/** FAQ list — pure copy, read straight from i18n. */
export const useFaqs = () => {
  const { t, i18n } = useTranslation();
  return useMemo(() => {
    const items = t("faq.items", { returnObjects: true });
    return Array.isArray(items) ? items : [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, i18n.language]);
};
