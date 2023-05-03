/**
 * @jest-environment node
 */
import { useServerTranslation } from '@mediature/main/src/i18n';
import { extractCaseHumanIdFromEmailFactory, getCaseEmailFactory } from '@mediature/main/src/utils/business/case';

describe('extractCaseHumanIdFromEmail()', () => {
  const { t } = useServerTranslation('common');

  const domain = 'mediature.local.fr';
  const getCaseEmail = getCaseEmailFactory(domain);
  const extractCaseHumanIdFromEmail = extractCaseHumanIdFromEmailFactory(domain);

  it('should extract something', async () => {
    const caseHumanId = extractCaseHumanIdFromEmail('dossier-41@mediature.local.fr');

    expect(caseHumanId).toBe('41');
  });

  it('should not extract anything', async () => {
    const caseHumanId = extractCaseHumanIdFromEmail('thomas@mediature.fr');

    expect(caseHumanId).toBeNull();
  });

  it('should combine correctly with its opposite', async () => {
    const originalEmail = 'dossier-41@mediature.local.fr';

    const caseHumanId = extractCaseHumanIdFromEmail('dossier-41@mediature.local.fr');

    expect(caseHumanId).not.toBeNull();

    const generatedEmail = getCaseEmail(t, caseHumanId as string);

    expect(generatedEmail).toBe(originalEmail);
  });
});
