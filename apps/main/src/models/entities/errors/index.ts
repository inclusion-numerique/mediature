import { customErrorFactory } from 'ts-custom-error';

import { getServerTranslation } from '@mediature/main/src/i18n';

const UnexpectedError = customErrorFactory(function UnexpectedError(code: string, message = '') {
  this.code = code;
  this.message = message;
});

const BusinessError = customErrorFactory(function BusinessError(code: string, message = '') {
  this.code = code;
  this.message = message;
});

// The logged errors (console or API) are written by default in english
// but the displayer/frontend is able to translate the content thanks to the error code
const { t } = getServerTranslation('common', {
  lng: 'en',
});

export const passwordRequiresANumericError = new BusinessError('passwordRequiresANumeric', t('errors.passwordRequiresANumeric'));
export const passwordRequiresHeightCharactersError = new BusinessError(
  'passwordRequiresHeightCharacters',
  t('errors.passwordRequiresHeightCharacters')
);
export const passwordRequiresLowerAndUpperCharactersError = new BusinessError(
  'passwordRequiresLowerAndUpperCharacters',
  t('errors.passwordRequiresLowerAndUpperCharacters')
);
export const passwordRequiresASpecialCharactersError = new BusinessError(
  'passwordRequiresASpecialCharacters',
  t('errors.passwordRequiresASpecialCharacters')
);
