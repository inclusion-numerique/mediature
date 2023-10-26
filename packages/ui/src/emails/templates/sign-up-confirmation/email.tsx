import { MjmlButton, MjmlText } from '@luma-team/mjml-react';

import { StandardLayout } from '@mediature/ui/src/emails/layouts/standard';

export function formatTitle() {
  return `Confirmation d'inscription`;
}

export interface SignUpConfirmationEmailProps {
  firstname: string;
  signInUrl: string;
}

export function SignUpConfirmationEmail(props: SignUpConfirmationEmailProps) {
  const title = formatTitle();

  return (
    <StandardLayout title={title}>
      <MjmlText>
        <h1>{title}</h1>
        <p>Bonjour {props.firstname},</p>
        <p>Nous sommes ravis de te confirmer que ton compte a été créé.</p>
      </MjmlText>
      <MjmlButton href={props.signInUrl}>Se connecter</MjmlButton>
      <MjmlText>
        <p style={{ fontWeight: 'bold' }}>
          Tes identifiants sont strictement personnels, et en aucun cas l&apos;équipe Médiature ne te demandera de les communiquer.
        </p>
        <p>
          Si tu as la moindre question concernant la plateforme, ou une idée d&apos;amélioration, n&apos;hésite pas à contacter le support depuis ton
          espace membre.
        </p>
      </MjmlText>
    </StandardLayout>
  );
}
