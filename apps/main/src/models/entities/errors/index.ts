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
// Errors definition
//

// General
export const internalServerErrorError = new UnexpectedError('internalServerError', t('errors.custom.internalServerError'));
export const unexpectedErrorError = new UnexpectedError('unexpectedError', t('errors.custom.unexpectedError'));

// Validations
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

export const phoneCombinationInvalidError = new BusinessError('phoneCombinationInvalid', t('errors.validation.phone.phoneCombinationInvalid'));
export const phoneCombinationInvalidWithLeadingZeroWarningError = new BusinessError(
  'phoneCombinationInvalidWithLeadingZeroWarning',
  t('errors.validation.phone.phoneCombinationInvalidWithLeadingZeroWarning')
);
export const phoneInvalidError = new BusinessError('phoneInvalid', t('errors.validation.phone.phoneInvalid'));

export const lexicalFieldRequiredError = new BusinessError('lexicalFieldRequired', t('errors.validation.content.lexicalFieldRequired'));
export const lexicalFieldInvalidFormatError = new BusinessError(
  'lexicalFieldInvalidFormat',
  t('errors.validation.content.lexicalFieldInvalidFormat')
);

export const caseCannotHadPreviousRequestAnswerIfNoDeclaredRequestError = new BusinessError(
  'caseCannotHadPreviousRequestAnswerIfNoDeclaredRequest',
  t('errors.validation.caseCannotHadPreviousRequestAnswerIfNoDeclaredRequest')
);
export const caseCannotHaveCompetentThirdPartyIfMarkedAsCompetentError = new BusinessError(
  'caseCannotHadPreviousRequestAnswerIfNoDeclaredRequest',
  t('errors.validation.caseCannotHadPreviousRequestAnswerIfNoDeclaredRequest')
);
export const caseMustHaveOutcomeWhenClosedError = new BusinessError(
  'caseMustHaveOutcomeWhenClosed',
  t('errors.validation.caseMustHaveOutcomeWhenClosed')
);

export const mustProvideAtLeastOneInformationToBeReachedError = new BusinessError(
  'mustProvideAtLeastOneInformationToBeReached',
  t('errors.validation.mustProvideAtLeastOneInformationToBeReached')
);
export const cannotHadPreviousRequestAnswerIfNoDeclaredRequestError = new BusinessError(
  'cannotHadPreviousRequestAnswerIfNoDeclaredRequest',
  t('errors.validation.cannotHadPreviousRequestAnswerIfNoDeclaredRequest')
);
export const cannotHaveCompetentThirdPartyIfMarkedAsCompetentError = new BusinessError(
  'cannotHaveCompetentThirdPartyIfMarkedAsCompetent',
  t('errors.validation.cannotHaveCompetentThirdPartyIfMarkedAsCompetent')
);
export const cannotSetCaseDomainIfNotMarkedAsCompetentError = new BusinessError(
  'cannotSetCaseDomainIfNotMarkedAsCompetent',
  t('errors.validation.cannotSetCaseDomainIfNotMarkedAsCompetent')
);
export const cannotCloseCaseWithoutOutcomeError = new BusinessError(
  'cannotCloseCaseWithoutOutcome',
  t('errors.validation.cannotCloseCaseWithoutOutcome')
);

export const countryInvalidError = new BusinessError('countryInvalid', t('errors.validation.address.countryCode.countryInvalid'));

// File upload
export const fileIdMalformatedError = new BusinessError('fileIdMalformated', t('errors.custom.fileIdMalformated'));
export const fileNotFoundError = new BusinessError('fileNotFound', t('errors.custom.fileNotFound'));
export const fileAccessLinkHasExpiredError = new BusinessError('fileAccessLinkHasExpired', t('errors.custom.fileAccessLinkHasExpired'));
export const fileAccessNotAuthorizedError = new BusinessError('fileAccessNotAuthorized', t('errors.custom.fileAccessNotAuthorized'));
export const tooManyUploadedFilesError = new BusinessError('tooManyUploadedFiles', t('errors.custom.tooManyUploadedFiles'));
export const fileUploadError = new BusinessError('fileUpload', t('errors.custom.fileUpload'));

// Authentication
export const authCredentialsRequiredError = new BusinessError('authCredentialsRequired', t('errors.custom.authCredentialsRequired'));
export const authNoCredentialsMatchError = new BusinessError('authNoCredentialsMatch', t('errors.custom.authNoCredentialsMatch'));
export const authRetriableError = new BusinessError('authRetriable', t('errors.custom.authRetriable'));
export const authFatalError = new BusinessError('authFatal', t('errors.custom.authFatal'));
export const unauthorizedError = new BusinessError('unauthorizedError', t('errors.custom.unauthorizedError'));

// Sign up
export const accountAlreadyWithThisEmailError = new BusinessError('accountAlreadyWithThisEmail', t('errors.custom.accountAlreadyWithThisEmail'));
export const missingInvitationError = new BusinessError('missingInvitation', t('errors.custom.missingInvitation'));
export const invalidInvitationError = new BusinessError('invalidInvitation', t('errors.custom.invalidInvitation'));
export const alreadyUsedInvitationError = new BusinessError('alreadyUsedInvitation', t('errors.custom.alreadyUsedInvitation'));
export const canceledInvitationError = new BusinessError('canceledInvitation', t('errors.custom.canceledInvitation'));

// Request new password
export const noAccountWithThisEmailError = new BusinessError('noAccountWithThisEmail', t('errors.custom.noAccountWithThisEmail'));

// Reset password
export const invalidVerificationTokenError = new BusinessError('invalidVerificationToken', t('errors.custom.invalidVerificationToken'));
export const expiredVerificationTokenError = new BusinessError('expiredVerificationToken', t('errors.custom.expiredVerificationToken'));

// Change password
export const invalidCurrentPasswordError = new BusinessError('invalidCurrentPassword', t('errors.custom.invalidCurrentPassword'));

// Case
export const caseNotFoundError = new BusinessError('caseNotFound', t('errors.custom.caseNotFound'));
export const documentNotFoundError = new BusinessError('documentNotFound', t('errors.custom.documentNotFound'));
export const mustBeAssignedToThisCaseError = new BusinessError('mustBeAssignedToThisCase', t('errors.custom.mustBeAssignedToThisCase'));
export const mustBePartOfAuthorityToUpdateCaseError = new BusinessError(
  'mustBePartOfAuthorityToUpdateCase',
  t('errors.custom.mustBePartOfAuthorityToUpdateCase')
);
export const cannotAssignYourselfIfAlreadyAssignedError = new BusinessError(
  'cannotAssignYourselfIfAlreadyAssigned',
  t('errors.custom.cannotAssignYourselfIfAlreadyAssigned')
);
export const cannotAssignAgentFromAnotherAuthorityError = new BusinessError(
  'cannotAssignAgentFromAnotherAuthority',
  t('errors.custom.cannotAssignAgentFromAnotherAuthority')
);
export const agentCanOnlyAccessItsAuthorityCasesError = new BusinessError(
  'agentCanOnlyAccessItsAuthorityCases',
  t('errors.custom.agentCanOnlyAccessItsAuthorityCases')
);
export const assignedToCaseOrAuthorityMainAgentRoleRequiredError = new BusinessError(
  'assignedToCaseOrAuthorityMainAgentRoleRequired',
  t('errors.custom.assignedToCaseOrAuthorityMainAgentRoleRequired')
);
export const agentCanOnlySeeAuthorityCasesError = new BusinessError(
  'agentCanOnlySeeAuthorityCases',
  t('errors.custom.agentCanOnlySeeAuthorityCases')
);

// Messenger
export const cannotMarkAsProcessedReceivedMessagesError = new BusinessError(
  'cannotMarkAsProcessedReceivedMessages',
  t('errors.custom.cannotMarkAsProcessedReceivedMessages')
);

// User
export const userNotFoundError = new BusinessError('userNotFound', t('errors.custom.userNotFound'));
export const cannotDeleteUserStillAgentError = new BusinessError('cannotDeleteUserStillAgent', t('errors.custom.cannotDeleteUserStillAgent'));

// Authority
export const authorityNotFoundError = new BusinessError('authorityNotFound', t('errors.custom.authorityNotFound'));
export const agentAlreadyInAuthorityError = new BusinessError('agentAlreadyInAuthority', t('errors.custom.agentAlreadyInAuthority'));
export const missingRightsToSearchThroughAuthoritiesError = new BusinessError(
  'missingRightsToSearchThroughAuthorities',
  t('errors.custom.missingRightsToSearchThroughAuthorities')
);
export const anotherAuthorityAlreadyHasThisNameError = new BusinessError(
  'anotherAuthorityAlreadyHasThisName',
  t('errors.custom.anotherAuthorityAlreadyHasThisName')
);
export const anotherAuthorityAlreadyHasThisSlugError = new BusinessError(
  'anotherAuthorityAlreadyHasThisSlug',
  t('errors.custom.anotherAuthorityAlreadyHasThisSlug')
);
export const cannotDeleteAuthorityStillHavingAgentsError = new BusinessError(
  'cannotDeleteAuthorityStillHavingAgents',
  t('errors.custom.cannotDeleteAuthorityStillHavingAgents')
);

// Invitation
export const invitationNoLongerUsableError = new BusinessError('invitationNoLongerUsable', t('errors.custom.invitationNoLongerUsable'));
export const invitationNotFoundError = new BusinessError('invitationNotFound', t('errors.custom.invitationNotFound'));
export const invitationCannotBeCanceledError = new BusinessError('invitationCannotBeCanceled', t('errors.custom.invitationCannotBeCanceled'));
export const adminInvitationAlreadySentError = new BusinessError('adminInvitationAlreadySent', t('errors.custom.adminInvitationAlreadySent'));
export const agentInvitationAlreadySentError = new BusinessError('agentInvitationAlreadySent', t('errors.custom.agentInvitationAlreadySent'));

// Access
export const adminRoleRequiredError = new BusinessError('adminRoleRequired', t('errors.custom.adminRoleRequired'));
export const adminOrAuthorityMainAgentRoleRequiredError = new BusinessError(
  'adminOrAuthorityMainAgentRoleRequired',
  t('errors.custom.adminOrAuthorityMainAgentRoleRequired')
);
export const adminOrAuthorityAgentRoleRequiredError = new BusinessError(
  'adminOrAuthorityAgentRoleRequired',
  t('errors.custom.adminOrAuthorityAgentRoleRequired')
);
export const authorityMainAgentRoleRequiredError = new BusinessError(
  'authorityMainAgentRoleRequired',
  t('errors.custom.authorityMainAgentRoleRequired')
);
export const cannotRevokeOwnAdminRoleError = new BusinessError('cannotRevokeOwnAdminRole', t('errors.custom.cannotRevokeOwnAdminRole'));
export const authorityAgentRoleRequiredError = new BusinessError('authorityAgentRoleRequired', t('errors.custom.authorityAgentRoleRequired'));

// Agent
export const agentNotFoundError = new BusinessError('agentNotFound', t('errors.custom.agentNotFound'));
export const agentNotPartOfThisAuthorityError = new BusinessError('agentNotPartOfThisAuthority', t('errors.custom.agentNotPartOfThisAuthority'));

// Items
export const domainNotFoundError = new BusinessError('domainNotFound', t('errors.custom.domainNotFound'));
export const domainToBindNotFoundError = new BusinessError('domainToBindNotFound', t('errors.custom.domainToBindNotFound'));
export const domainCreationMustBeLowLevelError = new BusinessError('domainCreationMustBeLowLevel', t('errors.custom.domainCreationMustBeLowLevel'));
export const domainMustBeScopedCorrectlyError = new BusinessError('domainMustBeScopedCorrectly', t('errors.custom.domainMustBeScopedCorrectly'));
export const globalDomainMustBeScopedCorrectlyError = new BusinessError(
  'globalDomainMustBeScopedCorrectly',
  t('errors.custom.globalDomainMustBeScopedCorrectly')
);
export const mustBePartOfAuthorityToListCaseDomainsError = new BusinessError(
  'mustBePartOfAuthorityToListCaseDomains',
  t('errors.custom.mustBePartOfAuthorityToListCaseDomains')
);
export const mustBePartOfAuthorityToCreateCaseDomainError = new BusinessError(
  'mustBePartOfAuthorityToCreateCaseDomain',
  t('errors.custom.mustBePartOfAuthorityToCreateCaseDomain')
);
export const mustBePartOfAuthorityToUpdateCaseDomainError = new BusinessError(
  'mustBePartOfAuthorityToUpdateCaseDomain',
  t('errors.custom.mustBePartOfAuthorityToUpdateCaseDomain')
);
export const mustBePartOfAuthorityToDeleteCaseDomainError = new BusinessError(
  'mustBePartOfAuthorityToDeleteCaseDomain',
  t('errors.custom.mustBePartOfAuthorityToDeleteCaseDomain')
);
export const noBoundCaseToDeleteCaseDomainError = new BusinessError(
  'noBoundCaseToDeleteCaseDomain',
  t('errors.custom.noBoundCaseToDeleteCaseDomain')
);
export const noBoundChildCaseDomainToDeleteCaseDomainError = new BusinessError(
  'noBoundChildCaseDomainToDeleteCaseDomain',
  t('errors.custom.noBoundChildCaseDomainToDeleteCaseDomain')
);
export const mustBindCaseDomainWithRightScopeError = new BusinessError(
  'mustBindCaseDomainWithRightScope',
  t('errors.custom.mustBindCaseDomainWithRightScope')
);

export const competentThirdPartyNotFoundError = new BusinessError('competentThirdPartyNotFound', t('errors.custom.competentThirdPartyNotFound'));
export const competentThirdPartyToBindNotFoundError = new BusinessError(
  'competentThirdPartyToBindNotFound',
  t('errors.custom.competentThirdPartyToBindNotFound')
);
export const competentThirdPartyCreationMustBeLowLevelError = new BusinessError(
  'competentThirdPartyCreationMustBeLowLevel',
  t('errors.custom.competentThirdPartyCreationMustBeLowLevel')
);
export const competentThirdPartyMustBeScopedCorrectlyError = new BusinessError(
  'competentThirdPartyMustBeScopedCorrectly',
  t('errors.custom.competentThirdPartyMustBeScopedCorrectly')
);
export const globalCompetentThirdPartyMustBeScopedCorrectlyError = new BusinessError(
  'globalCompetentThirdPartyMustBeScopedCorrectly',
  t('errors.custom.globalCompetentThirdPartyMustBeScopedCorrectly')
);
export const mustBePartOfAuthorityToListCaseCompetentThirdPartiesError = new BusinessError(
  'mustBePartOfAuthorityToListCaseCompetentThirdParties',
  t('errors.custom.mustBePartOfAuthorityToListCaseCompetentThirdParties')
);
export const mustBePartOfAuthorityToCreateCaseCompetentThirdPartyError = new BusinessError(
  'mustBePartOfAuthorityToCreateCaseCompetentThirdParty',
  t('errors.custom.mustBePartOfAuthorityToCreateCaseCompetentThirdParty')
);
export const mustBePartOfAuthorityToUpdateCaseCompetentThirdPartyError = new BusinessError(
  'mustBePartOfAuthorityToUpdateCaseCompetentThirdParty',
  t('errors.custom.mustBePartOfAuthorityToUpdateCaseCompetentThirdParty')
);
export const mustBePartOfAuthorityToDeleteCaseCompetentThirdPartyError = new BusinessError(
  'mustBePartOfAuthorityToDeleteCaseCompetentThirdParty',
  t('errors.custom.mustBePartOfAuthorityToDeleteCaseCompetentThirdParty')
);
export const noBoundCaseToDeleteCaseCompetentThirdPartyError = new BusinessError(
  'noBoundCaseToDeleteCaseCompetentThirdParty',
  t('errors.custom.noBoundCaseToDeleteCaseCompetentThirdParty')
);
export const noBoundChildCaseCompetentThirdPartyToDeleteCaseCompetentThirdPartyError = new BusinessError(
  'noBoundChildCaseCompetentThirdPartyToDeleteCaseCompetentThirdParty',
  t('errors.custom.noBoundChildCaseCompetentThirdPartyToDeleteCaseCompetentThirdParty')
);
export const mustBindCaseCompetentThirdPartyWithRightScopeError = new BusinessError(
  'mustBindCaseCompetentThirdPartyWithRightScope',
  t('errors.custom.mustBindCaseCompetentThirdPartyWithRightScope')
);
