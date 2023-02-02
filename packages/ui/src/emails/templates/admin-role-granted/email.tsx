import { MjmlButton, MjmlText } from '@luma-team/mjml-react';

import { StandardLayout } from '@mediature/ui/src/emails/layouts/standard';

export function formatTitle() {
  return `Nouveaux droits sur la plateforme`;
}

export interface AdminRoleGrantedEmailProps {
  firstname: string;
  originatorFirstname: string;
  originatorLastname: string;
  adminDashboardUrl: string;
}

export function AdminRoleGrantedEmail(props: AdminRoleGrantedEmailProps) {
  const title = formatTitle();

  return (
    <StandardLayout title={title}>
      <MjmlText>
        <h1>{title}</h1>
        <p>Bonjour {props.firstname},</p>
        <p>
          {props.originatorFirstname} {props.originatorLastname} vient de te donner les droits d&apos;administrateur sur la plateforme.
        </p>
      </MjmlText>
      <MjmlButton href={props.adminDashboardUrl}>Accéder à l&apos;interface administrateur</MjmlButton>
      <MjmlText></MjmlText>
    </StandardLayout>
  );
}
