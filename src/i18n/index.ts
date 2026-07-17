import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import id from "./locales/id/common.json";
import en from "./locales/en/common.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      id: { common: id },
      en: { common: en },
    },
    // Sengaja TIDAK set `lng` di sini — biar LanguageDetector yang nentuin
    // (localStorage kalau user pernah pilih, atau bahasa browser).
    fallbackLng: "id",
    defaultNS: "common",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "inventory_lang",
    },
  });

export default i18n;
