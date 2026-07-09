import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";
import ka from "./locales/ka.json";

/**
 * i18n — English (en) + Georgian (ka).
 *
 * The active language is detected from localStorage first (persisted under
 * `goa-lang`), then the browser preference, defaulting to English. Switching
 * language re-renders every component that reads text through `useTranslation`
 * / the `useLocalized` data hooks, so the whole site flips at once.
 *
 * `<html lang>` is kept in sync on every change (see `syncHtmlLang`), which
 * matters for accessibility and for the correct font/hyphenation rules.
 */
export const LANGUAGES = [
  { code: "en", label: "English", short: "EN" },
  { code: "ka", label: "ქართული", short: "ქარ" },
];

export const STORAGE_KEY = "goa-lang";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ka: { translation: ka },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "ka"],
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: STORAGE_KEY,
      caches: ["localStorage"],
    },
    interpolation: { escapeValue: false },
    returnObjects: true,
  });

const syncHtmlLang = (lng) => {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("lang", lng);
  }
};

syncHtmlLang(i18n.resolvedLanguage || "en");
i18n.on("languageChanged", syncHtmlLang);

export default i18n;
