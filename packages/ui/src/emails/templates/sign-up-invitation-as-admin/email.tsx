import { MjmlButton, MjmlText } from '@luma-team/mjml-react';

import { StandardLayout } from '@mediature/ui/src/emails/layouts/standard';

export function formatTitle() {
  return `Inscription sur la plateforme`;
}

export interface SignUpInvitationAsAdminEmailProps {
  firstname?: string;
  lastname?: string;
  originatorFirstname: string;
  originatorLastname: string;
  signUpUrlWithToken: string;
}

export function PlatformDescriptionList() {
  return (
    <ol>
      <li>Simplifier la saisie des demandes citoyennes</li>
      <li>Donner aux médiateurs un outil numérique adapté à leur quotidien</li>
      <li>Sécuriser les documents sensibles d&apos;une saisine</li>
      <li>Permettre de comprendre les enjeux de la médiation au niveau de la collectivité et au niveau national</li>
    </ol>
  );
}

export function SignUpInvitationAsAdminEmail(props: SignUpInvitationAsAdminEmailProps) {
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
          {props.originatorFirstname} {props.originatorLastname} vous invite sur la plateforme Médiature pour y devenir administrateur.
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
