import { MjmlButton, MjmlText } from '@luma-team/mjml-react';

import { StandardLayout } from '@mediature/ui/src/emails/layouts/standard';

export function formatTitle() {
  return `Renouvellement de mot de passe`;
}

export interface NewPasswordRequestEmailProps {
  firstname: string;
  resetPasswordUrlWithToken: string;
}

export function NewPasswordRequestEmail(props: NewPasswordRequestEmailProps) {
  const title = formatTitle();

  return (
    <StandardLayout title={title}>
      <MjmlText>
        <h1>{title}</h1>
        <p>Bonjour {props.firstname},</p>
        <p>
          Une demande de &quot;mot de passe oublié&quot; vient d&apos;être effectuée pour votre compte. Cliquez sur le bouton ci-dessous pour saisir
          votre nouveau mot de passe.
        </p>
        <p>Si vous n&apos;êtes pas à l&apos;origine de cette action, merci d&apos;ignorer ce message.</p>
      </MjmlText>
      <MjmlButton href={props.resetPasswordUrlWithToken}>Réinitialiser mon mot de passe</MjmlButton>
      <MjmlText></MjmlText>
    </StandardLayout>
  );
}
