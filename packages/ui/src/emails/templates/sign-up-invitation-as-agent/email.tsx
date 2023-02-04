import { MjmlButton, MjmlText } from '@luma-team/mjml-react';

import { StandardLayout } from '@mediature/ui/src/emails/layouts/standard';
import { PlatformDescriptionList } from '@mediature/ui/src/emails/templates/sign-up-invitation-as-admin/email';

export function formatTitle() {
  return `Inscription sur la plateforme`;
}

export interface SignUpInvitationAsAgentEmailProps {
  firstname?: string;
  lastname?: string;
  originatorFirstname: string;
  originatorLastname: string;
  authorityName: string;
  signUpUrlWithToken: string;
}

export function SignUpInvitationAsAgentEmail(props: SignUpInvitationAsAgentEmailProps) {
  const title = formatTitle();

  return (
    <StandardLayout title={title}>
      <MjmlText>
        <h1>{title}</h1>
        {!!props.firstname && !!props.lastname ? (
          <p>
            Bonjour {props.firstname} {props.lastname},
          </p>
        ) : (
          <p>Bonjour,</p>
        )}
        <p>
          {props.originatorFirstname} {props.originatorLastname} vous invite sur la plateforme Médiature pour y devenir médiateur de la collectivité{' '}
          {props.authorityName}.
        </p>
        <p>
          Cette plateforme a pour objectifs :
          <PlatformDescriptionList />
        </p>
        <p>Cliquez sur le bouton ci-dessous pour poursuivre les démarches.</p>
      </MjmlText>
      <MjmlButton href={props.signUpUrlWithToken}>S&apos;inscrire sur la plateforme</MjmlButton>
      <MjmlText></MjmlText>
    </StandardLayout>
  );
}
