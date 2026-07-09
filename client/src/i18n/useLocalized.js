import { useMemo } from "react";
import { useTranslation } from "react-i18next";

/**
 * useLocalized — merge a language-independent "base" array (ids, icons,
 * accents, prices, numbers, stacks…) with the translated text for the
 * current language.
 *
 * The translated entries live in the locale JSON under `i18nKey` as an
 * array in the SAME ORDER as `base`. Each translated object is spread over
 * its positional base item, so structural fields stay a single source of
 * truth in the data file while the copy comes from en.json / ka.json.
 *
 *   const courses = useLocalized(COURSES_BASE, "courses.items");
 *
 * Keep the JSON array order in lock-step with the base array.
 */
export function useLocalized(base, i18nKey) {
  const { t, i18n } = useTranslation();
  return useMemo(() => {
    const tr = t(i18nKey, { returnObjects: true });
    if (!Array.isArray(tr)) return base;
    return base.map((item, i) => ({ ...item, ...(tr[i] || {}) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, i18nKey, i18n.language]);
}

export default useLocalized;
