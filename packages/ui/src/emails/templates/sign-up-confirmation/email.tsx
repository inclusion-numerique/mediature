import { MjmlButton, MjmlText } from '@luma-team/mjml-react';
import { PropsWithChildren } from 'react';

import { StandardLayout } from '@mediature/ui/src/emails/layouts/standard';

export interface StandardLayoutPropreties {
  firstname: string;
  signInUrl: string;
}

export function SignUpConfirmationEmail(props: PropsWithChildren<StandardLayoutPropreties>) {
  const title = `Confirmation d'inscription`;

  return (
    <StandardLayout title={title}>
      <MjmlText>
        <h1>{title}</h1>
        <p>Bonjour {props.firstname},</p>
        <p>Nous sommes ravis de te confirmer que ton compte a été créé.</p>
      </MjmlText>
      <MjmlButton href={props.signInUrl}>Se connecter</MjmlButton>
      <MjmlText>
        <p>
          Si vous tu as la moindre question concernant la plateforme, ou une idée d&apos;amélioration, n&apos;hésite pas à contacter le support depuis
          ton espace membre.
        </p>
      </MjmlText>
    </StandardLayout>
  );
}
