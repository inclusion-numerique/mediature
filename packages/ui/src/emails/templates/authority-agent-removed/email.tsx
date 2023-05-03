import { MjmlButton, MjmlText } from '@luma-team/mjml-react';

import { StandardLayout } from '@mediature/ui/src/emails/layouts/standard';

export function formatTitle() {
  return `Changement d'accès`;
}

export interface AuthorityAgentRemovedEmailProps {
  firstname: string;
  authorityName: string;
}

export function AuthorityAgentRemovedEmail(props: AuthorityAgentRemovedEmailProps) {
  const title = formatTitle();

  return (
    <StandardLayout title={title}>
      <MjmlText>
        <h1>{title}</h1>
        <p>Bonjour {props.firstname},</p>
        <p>
          Tu n&apos;as dorénavant plus les accès médiateur de la collectivité <span style={{ fontWeight: 'bold' }}>{props.authorityName}</span>.
        </p>
      </MjmlText>
    </StandardLayout>
  );
}
