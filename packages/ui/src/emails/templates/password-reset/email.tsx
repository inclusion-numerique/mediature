import { MjmlButton, MjmlText } from '@luma-team/mjml-react';

import { StandardLayout } from '@mediature/ui/src/emails/layouts/standard';

export function formatTitle() {
  return `Mot de passe réinitialisé`;
}

export interface PasswordResetEmailProps {
  firstname: string;
  signInUrl: string;
}

export function PasswordResetEmail(props: PasswordResetEmailProps) {
  const title = formatTitle();

  return (
    <StandardLayout title={title}>
      <MjmlText>
        <h1>{title}</h1>
        <p>Bonjour {props.firstname},</p>
        <p>La réinitialisation de ton mot de passe est maintenant effective, tu peux dès maintenant utiliser tes nouveaux identifiants.</p>
      </MjmlText>
      <MjmlButton href={props.signInUrl}>Se connecter</MjmlButton>
      <MjmlText></MjmlText>
    </StandardLayout>
  );
}
