// src/i18n/index.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import translation files
import translationEN from "../locales/en/translation.json";
import translationAR from "../locales/ar/translation.json";
import translationFR from "../locales/fr/translation.json";

// Define the resources (translations) by language
const resources = {
  en: { translation: translationEN },
  ar: { translation: translationAR },
  fr: { translation: translationFR },
};

// Initialize i18n
i18n
  .use(initReactI18next) // Passes i18n instance to react-i18next
  .init({
    resources,
    lng: "en", // Set default language to English
    fallbackLng: "en", // Fallback language if translation not found
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
  });

export default i18n;
