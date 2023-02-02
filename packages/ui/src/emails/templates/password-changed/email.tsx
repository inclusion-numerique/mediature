import { MjmlText } from '@luma-team/mjml-react';

import { StandardLayout } from '@mediature/ui/src/emails/layouts/standard';

export function formatTitle() {
  return `Mot de passe mis à jour`;
}

export interface PasswordChangedEmailProps {
  firstname: string;
}

export function PasswordChangedEmail(props: PasswordChangedEmailProps) {
  const title = formatTitle();

  return (
    <StandardLayout title={title}>
      <MjmlText>
        <h1>{title}</h1>
        <p>Bonjour {props.firstname},</p>
        <p>Nous avons bien pris en compte ton changement de mot de passe. Celui-ci est effectif dès maintenant.</p>
      </MjmlText>
    </StandardLayout>
  );
}
