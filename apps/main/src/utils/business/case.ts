import { getServerTranslation, supportedLanguages } from '@mediature/main/src/i18n';

// [WORKAROUND] `TFunction` is leaking into React types as soon as I import this current file into a `.tsx` file
// Casting as `any` is fine here due to single determined usage. There are no solution for now as stated into:
// - https://github.com/microsoft/TypeScript/issues/53087
// - https://github.com/i18next/next-i18next/issues/1795
// ---
// import { TFunction } from 'i18next';
// type TFunc = TFunction<'common'[], undefined, 'common'[];
type TFunc = any;

export function getCaseEmailFactory(domain: string) {
  return function getCaseEmail(t: TFunc, humanCaseId: string): string {
    return `${t('model.case.technicalName', { humanId: humanCaseId.toString() })}@${domain}`;
  };
}

export function extractCaseHumanIdFromEmailFactory(domain: string) {
  const scopedGetCaseEmail = getCaseEmailFactory(domain);

  return function (email: string): string | null {
    // Test possibilities in all languages
    for (const lng of supportedLanguages) {
      const { t } = getServerTranslation('common', {
        lng: lng,
      });

      // Format a pattern to analyze
      const emailPattern = scopedGetCaseEmail(t, '([0-9]*)');
      const regexp = new RegExp(emailPattern, 'i');
      const matches = email.match(regexp);
      if (matches && matches.length === 2) {
        // The first at index 0 is the whole matching regex
        const potentialHumanId = matches[1];

        // Just to be sure the parsing is right, try to rebuild it
        if (email === scopedGetCaseEmail(t, potentialHumanId)) {
          return potentialHumanId;
        }
      }
    }

    return null;
  };
}

const mailerDefaultDomain = process.env.MAILER_DEFAULT_DOMAIN || '';

export const getCaseEmail = getCaseEmailFactory(mailerDefaultDomain);
export const extractCaseHumanIdFromEmail = extractCaseHumanIdFromEmailFactory(mailerDefaultDomain);
