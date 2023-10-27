import { CustomError } from 'ts-custom-error';

import { getServerTranslation } from '@mediature/main/src/i18n';

export class UnexpectedError extends CustomError {
  public constructor(public readonly code: string, message: string = '') {
    super(message);
  }

  public json(): object {
    return {
      code: this.code,
      message: this.message,
    };
  }
}

export class BusinessError extends CustomError {
  public constructor(public readonly code: string, message: string = '', public readonly httpCode?: number) {
    super(message);
  }

  public cloneWithHttpCode(httpCode: number): BusinessError {
    return new BusinessError(this.code, this.message, httpCode);
  }

  public json(): object {
    return {
      code: this.code,
      message: this.message,
    };
  }
}

// The logged errors (console or API) are written by default in english (but will take french if english not filled)
// but the displayer/frontend is able to translate the content thanks to the error code
const { t } = getServerTranslation('common', {
  lng: 'en',
});

//
// General
//

export const internalServerErrorError = new UnexpectedError('internalServerError', t('errors.internalServerError'));

//
// Validations
//

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

//
// File upload
//

export const fileIdMalformatedError = new BusinessError('fileIdMalformated', t('errors.fileIdMalformated'));
export const fileNotFoundError = new BusinessError('fileNotFound', t('errors.fileNotFound'));
export const fileAccessLinkHasExpiredError = new BusinessError('fileAccessLinkHasExpired', t('errors.fileAccessLinkHasExpired'));
export const fileAccessNotAuthorizedError = new BusinessError('fileAccessNotAuthorized', t('errors.fileAccessNotAuthorized'));

//
// Authentication
//

export const authCredentialsRequiredError = new BusinessError('authCredentialsRequired', t('errors.authCredentialsRequired'));
export const authNoCredentialsMatchError = new BusinessError('authNoCredentialsMatch', t('errors.authNoCredentialsMatch'));
export const authRetriableError = new BusinessError('authRetriable', t('errors.authRetriable'));
export const authFatalError = new BusinessError('authFatal', t('errors.authFatal'));
