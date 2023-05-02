import type { Locale } from 'date-fns';
import utcToZonedTime from 'date-fns-tz/utcToZonedTime';
import formatDate from 'date-fns/format';
import formatDistance from 'date-fns/formatDistance';
import formatRelative from 'date-fns/formatRelative';
import isDate from 'date-fns/isDate';
import frDateLocale from 'date-fns/locale/fr';
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import prettyBytes from 'pretty-bytes';

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

export const dateFnsLocales: DateLocales = { fr: frDateLocale };

export type Lang = 'fr' | 'en'; // If more locales available, add them here
export const supportedLanguages: Lang[] = ['fr'];
const fallbackLanguage: Lang = 'fr';

i18next.use(LanguageDetector).init(
  {
    detection: {
      order: ['cookie', 'localStorage', 'navigator'],
    },
    supportedLngs: supportedLanguages,
    fallbackLng: fallbackLanguage,
    defaultNS: defaultNamespace,
    returnEmptyString: false,
    returnNull: false,
    interpolation: {
      escapeValue: false, // React already safes from xss
      format: (value, format, lng, options) => {
        if (!!format && !!lng) {
          if (isDate(value)) {
            if (options) {
              // If specified we shift the date from UTC (with its offset marker)
              // to the right time without any offset marker (useful to format on server-side)
              if (options.timezone) {
                value = utcToZonedTime(value, options.timezone);
              }
            }

            const locale = dateFnsLocales[lng];

            if (format === 'short') return formatDate(value, 'P', { locale });
            if (format === 'long') return formatDate(value, 'PPPP', { locale });
            if (format === 'longWithTime') return formatDate(value, 'PPPPpp', { locale });
            if (format === 'relative') return formatRelative(value, new Date(), { locale });
            if (format === 'ago') {
              return formatDistance(value, new Date(), {
                locale,
                addSuffix: true,
              });
            }
            if (format === 'spreadsheetDate') return formatDate(value, 'yyyy-MM-dd', { locale });
            if (format === 'spreadsheetDateTime') return formatDate(value, 'yyyy-MM-dd HH:mm:ss', { locale });

            return formatDate(value, format, { locale });
          } else if (typeof value === 'number') {
            if (format === 'humanFileSize') {
              return prettyBytes(value, {
                locale: lng,
              });
            }
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

export interface UseServerTranslationOptions {
  lng?: string;
  timezone?: string;
}

export const getServerTranslation = (ns?: string, options?: UseServerTranslationOptions) => {
  const scopedI18n = i18n.cloneInstance();

  if (ns) {
    scopedI18n.setDefaultNamespace(ns);
  }

  let timezone: string = 'Europe/Paris';
  if (options) {
    if (options.lng) {
      scopedI18n.changeLanguage(options.lng);
    }

    if (options.timezone) {
      timezone = options.timezone;
    }
  }

  // [WORKAROUND] There is no way to add a preprocessor to i18next (whereas postprocessors are implemented)
  // so we wrap the initial `t()` function to allow passing a default date timezone that will be used during interpolation operations
  // This is useful on the server-side when rendering documents or emails because all dates from the database are UTC by default
  const originalTFunction = scopedI18n.t;

  scopedI18n.t = function (key: string, parameters?: any): any {
    if (!parameters) {
      parameters = {};
    }

    parameters.timezone = timezone;

    return originalTFunction(key, parameters);
  } as any;

  return scopedI18n;
};

// This alias to mimic the hook naming logic (but some backend files need the `getServerTranslation` to avoid a complain from the ESLint rule `react-hooks/rules-of-hooks`)
export const useServerTranslation = getServerTranslation;
