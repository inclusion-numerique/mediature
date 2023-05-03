import { MjmlText } from '@luma-team/mjml-react';

import { StandardLayout } from '@mediature/ui/src/emails/layouts/standard';

export function formatTitle() {
  return `Droits révoqués sur la plateforme`;
}

export interface AdminRoleRevokedEmailProps {
  firstname: string;
  originatorFirstname: string;
  originatorLastname: string;
}

export function AdminRoleRevokedEmail(props: AdminRoleRevokedEmailProps) {
  const title = formatTitle();

  return (
    <StandardLayout title={title}>
      <MjmlText>
        <h1>{title}</h1>
        <p>Bonjour {props.firstname},</p>
        <p>
          {props.originatorFirstname} {props.originatorLastname} vient de t&apos;enlever les droits d&apos;administrateur sur la plateforme.
        </p>
      </MjmlText>
    </StandardLayout>
  );
}
