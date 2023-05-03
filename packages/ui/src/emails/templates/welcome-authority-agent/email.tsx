import { MjmlButton, MjmlText } from '@luma-team/mjml-react';

import { StandardLayout } from '@mediature/ui/src/emails/layouts/standard';

export function formatTitle() {
  return `Bienvenue !`;
}

export interface WelcomeAuthorityAgentEmailProps {
  firstname: string;
  originatorFirstname: string;
  originatorLastname: string;
  authorityName: string;
  authorityDashboardUrl: string;
}

export function WelcomeAuthorityAgentEmail(props: WelcomeAuthorityAgentEmailProps) {
  const title = formatTitle();

  return (
    <StandardLayout title={title}>
      <MjmlText>
        <h1>{title}</h1>
        <p>Bonjour {props.firstname},</p>
        <p>
          {props.originatorFirstname} {props.originatorLastname} vient de te nommer médiateur au sein de la collectivité {props.authorityName}.
        </p>
        <p>Tu peux dès à présent accéder à la plateforme pour prendre en charge les demandes de médiation.</p>
      </MjmlText>
      <MjmlButton href={props.authorityDashboardUrl}>Accéder à la plateforme</MjmlButton>
      <MjmlText></MjmlText>
    </StandardLayout>
  );
}
