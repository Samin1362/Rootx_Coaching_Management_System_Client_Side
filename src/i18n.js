import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translation files
import enTranslation from "./locales/en/translation.json";
import bnTranslation from "./locales/bn/translation.json";
import enCommon from "./locales/en/common.json";
import bnCommon from "./locales/bn/common.json";
import enNavbar from "./locales/en/navbar.json";
import bnNavbar from "./locales/bn/navbar.json";
import enAuth from "./locales/en/auth.json";
import bnAuth from "./locales/bn/auth.json";
import enAdmissions from "./locales/en/admissions.json";
import bnAdmissions from "./locales/bn/admissions.json";
import enOverview from "./locales/en/overview.json";
import bnOverview from "./locales/bn/overview.json";

const resources = {
  en: {
    translation: enTranslation,
    common: enCommon,
    navbar: enNavbar,
    auth: enAuth,
    admissions: enAdmissions,
    overview: enOverview,
  },
  bn: {
    translation: bnTranslation,
    common: bnCommon,
    navbar: bnNavbar,
    auth: bnAuth,
    admissions: bnAdmissions,
    overview: bnOverview,
  },
};

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    fallbackLng: "en", // Default language if detection fails
    debug: false, // Set to true for development debugging

    // Language detection options
    detection: {
      order: ["localStorage", "navigator"], // Check localStorage first, then browser settings
      caches: ["localStorage"], // Cache the selected language in localStorage
      lookupLocalStorage: "i18nextLng", // Key to store language in localStorage
    },

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // Namespace configuration
    ns: ["translation", "common", "navbar", "auth", "admissions", "overview"],
    defaultNS: "common",

    // React specific options
    react: {
      useSuspense: false, // Set to false to avoid loading issues
    },
  });

export default i18n;
