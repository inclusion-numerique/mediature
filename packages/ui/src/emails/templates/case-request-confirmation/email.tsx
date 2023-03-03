import addressFormatter from '@fragaria/address-formatter';
import { MjmlDivider, MjmlText } from '@luma-team/mjml-react';
import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';

import { useServerTranslation } from '@mediature/main/src/i18n/index';
import { RequestCaseSchemaType } from '@mediature/main/src/models/actions/case';
import { StandardLayout } from '@mediature/ui/src/emails/layouts/standard';
import { convertInputModelToGooglePhoneNumber } from '@mediature/ui/src/utils/phone';

const phoneNumberUtil = PhoneNumberUtil.getInstance();

export function formatTitle() {
  return `Demande de médiation reçue`;
}

export function formatListHeader(header: string) {
  return <span style={{ fontWeight: 'bold' }}>{header}</span>;
}

export interface CaseRequestConfirmationEmailProps {
  firstname: string;
  lastname: string;
  caseHumanId: string;
  authorityName: string;
  submittedRequestData: RequestCaseSchemaType;
}

export function CaseRequestConfirmationEmail(props: CaseRequestConfirmationEmailProps) {
  const { t } = useServerTranslation('common');
  const title = formatTitle();

  return (
    <StandardLayout title={title}>
      <MjmlText>
        <h1>{title}</h1>
        <p>
          {props.firstname} {props.lastname},
        </p>
        <p>
          Nous vous informons que la demande de médiation que vous venez de déposer a bien été prise en compte sous le numéro de dossier{' '}
          {props.caseHumanId}.
        </p>
        <p>Un médiateur de la collectivité {props.authorityName} vous contactera dans les prochains jours pour vous aider dans vos démarches.</p>
      </MjmlText>
      {props.submittedRequestData.emailCopyWanted && (
        <>
          <MjmlDivider />
          <MjmlText>
            <p>
              Vous avez demandé à recevoir une copie des informations renseignées que vous trouverez ci-dessous :
              <ul>
                <li>
                  {formatListHeader('Email :')} {props.submittedRequestData.email}
                </li>
                <li>
                  {formatListHeader('Prénom :')} {props.submittedRequestData.firstname}
                </li>
                <li>
                  {formatListHeader('Nom :')} {props.submittedRequestData.lastname}
                </li>
                <li>
                  {formatListHeader('Adresse :')}{' '}
                  {addressFormatter.format({
                    street: props.submittedRequestData.address.street,
                    city: props.submittedRequestData.address.city,
                    postcode: props.submittedRequestData.address.postalCode,
                    state: props.submittedRequestData.address.subdivision,
                    countryCode: props.submittedRequestData.address.countryCode,
                  })}
                </li>
                <li>
                  {formatListHeader('Téléphone :')}{' '}
                  {phoneNumberUtil.format(convertInputModelToGooglePhoneNumber(props.submittedRequestData.phone), PhoneNumberFormat.NATIONAL)}
                </li>
                <li>
                  <>
                    {formatListHeader('Premier recours déjà effectué :')}{' '}
                    {props.submittedRequestData.alreadyRequestedInThePast ? t('boolean.true') : t('boolean.false')}
                  </>
                </li>
                {props.submittedRequestData.alreadyRequestedInThePast && (
                  <li>
                    <>
                      {formatListHeader('Réponse suite au premier recours :')}{' '}
                      {props.submittedRequestData.gotAnswerFromPreviousRequest === true ? t('boolean.true') : t('boolean.false')}
                    </>
                  </li>
                )}
                <li>
                  {formatListHeader('Description :')} {props.submittedRequestData.description}
                </li>
                {/* TODO: add the number of attachments? Or their name? */}
              </ul>
            </p>
          </MjmlText>
        </>
      )}
    </StandardLayout>
  );
}
