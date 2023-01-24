import { format as formatDate, formatDistance, formatRelative, isDate } from 'date-fns';
import { Locale } from 'date-fns';
import { fr as frDateLocale } from 'date-fns/locale';
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

interface DateLocales {
  [key: string]: Locale;
}

const dateFnsLocales: DateLocales = { fr: frDateLocale };

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
      format: (value, format, lng) => {
        if (!!format && !!lng) {
          if (isDate(value)) {
            const locale = dateFnsLocales[lng];

            if (format === 'short') return formatDate(value, 'P', { locale });
            if (format === 'long') return formatDate(value, 'PPPP', { locale });
            if (format === 'relative') return formatRelative(value, new Date(), { locale });
            if (format === 'ago') {
              return formatDistance(value, new Date(), {
                locale,
                addSuffix: true,
              });
            }

            return formatDate(value, format, { locale });
          }
        }

        return value;
      },
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
