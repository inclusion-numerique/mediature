import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import frCommonTranslations from '@mediature/main/src/i18n/fr/common.json';

export const defaultNamespace = 'common';

export const resources = {
  fr: {
    common: frCommonTranslations,
  },
  // en: {
  //   common: enCommonTranslations,
  // },
};

i18next.use(LanguageDetector).init(
  {
    detection: {
      order: ['cookie', 'localStorage', 'navigator'],
    },
    fallbackLng: 'fr',
    defaultNS: defaultNamespace,
    returnEmptyString: false,
    returnNull: false,
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
    resources: resources,
    debug: false,
  },
  (err, t) => {
    // Set locale on other librairies according to the locale detected by `LanguageDetector`
    const detectedLocale = i18next.language;
  }
);

export const i18n = i18next;
