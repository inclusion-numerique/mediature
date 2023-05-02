import { TFunction } from 'i18next';

import { getServerTranslation, supportedLanguages } from '@mediature/main/src/i18n';

export function getCaseEmailFactory(domain: string) {
  return function getCaseEmail(t: TFunction<'common'[], undefined, 'common'[]>, humanCaseId: string): string {
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
