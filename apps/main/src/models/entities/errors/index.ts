import { CustomError as LibraryCustomError } from 'ts-custom-error';

import { getServerTranslation } from '@mediature/main/src/i18n';

export class CustomError extends LibraryCustomError {
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

export class UnexpectedError extends CustomError {}

export class BusinessError extends CustomError {
  public constructor(code: string, message: string = '', public readonly httpCode?: number) {
    super(code, message);
  }

  public cloneWithHttpCode(httpCode: number): BusinessError {
    return new BusinessError(this.code, this.message, httpCode);
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

export const internalServerErrorError = new UnexpectedError('internalServerError', t('errors.custom.internalServerError'));
export const unexpectedErrorError = new UnexpectedError('unexpectedError', t('errors.custom.unexpectedError'));

//
// Validations
//

export const passwordRequiresANumericError = new BusinessError(
  'passwordRequiresANumeric',
  t('errors.validation.newPassword.passwordRequiresANumeric')
);
export const passwordRequiresHeightCharactersError = new BusinessError(
  'passwordRequiresHeightCharacters',
  t('errors.validation.newPassword.passwordRequiresHeightCharacters')
);
export const passwordRequiresLowerAndUpperCharactersError = new BusinessError(
  'passwordRequiresLowerAndUpperCharacters',
  t('errors.validation.newPassword.passwordRequiresLowerAndUpperCharacters')
);
export const passwordRequiresASpecialCharactersError = new BusinessError(
  'passwordRequiresASpecialCharacters',
  t('errors.validation.newPassword.passwordRequiresASpecialCharacters')
);

//
// File upload
//

export const fileIdMalformatedError = new BusinessError('fileIdMalformated', t('errors.custom.fileIdMalformated'));
export const fileNotFoundError = new BusinessError('fileNotFound', t('errors.custom.fileNotFound'));
export const fileAccessLinkHasExpiredError = new BusinessError('fileAccessLinkHasExpired', t('errors.custom.fileAccessLinkHasExpired'));
export const fileAccessNotAuthorizedError = new BusinessError('fileAccessNotAuthorized', t('errors.custom.fileAccessNotAuthorized'));

//
// Authentication
//

export const authCredentialsRequiredError = new BusinessError('authCredentialsRequired', t('errors.custom.authCredentialsRequired'));
export const authNoCredentialsMatchError = new BusinessError('authNoCredentialsMatch', t('errors.custom.authNoCredentialsMatch'));
export const authRetriableError = new BusinessError('authRetriable', t('errors.custom.authRetriable'));
export const authFatalError = new BusinessError('authFatal', t('errors.custom.authFatal'));

//
// Sign up
//

export const accountAlreadyWithThisEmailError = new BusinessError('accountAlreadyWithThisEmail', t('errors.custom.accountAlreadyWithThisEmail'));
export const missingInvitationError = new BusinessError('missingInvitation', t('errors.custom.missingInvitation'));
export const invalidInvitationError = new BusinessError('invalidInvitation', t('errors.custom.invalidInvitation'));
export const alreadyUsedInvitationError = new BusinessError('alreadyUsedInvitation', t('errors.custom.alreadyUsedInvitation'));
export const canceledInvitationError = new BusinessError('canceledInvitation', t('errors.custom.canceledInvitation'));

//
// Request new password
//

export const noAccountWithThisEmailError = new BusinessError('noAccountWithThisEmail', t('errors.custom.noAccountWithThisEmail'));

//
// Reset password
//

export const invalidVerificationTokenError = new BusinessError('invalidVerificationToken', t('errors.custom.invalidVerificationToken'));
export const expiredVerificationTokenError = new BusinessError('expiredVerificationToken', t('errors.custom.expiredVerificationToken'));

//
// Change password
//

export const invalidCurrentPasswordError = new BusinessError('invalidCurrentPassword', t('errors.custom.invalidCurrentPassword'));
