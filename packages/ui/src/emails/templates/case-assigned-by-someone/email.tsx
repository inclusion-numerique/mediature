import { MjmlButton, MjmlText } from '@luma-team/mjml-react';

import { StandardLayout } from '@mediature/ui/src/emails/layouts/standard';

export function formatTitle() {
  return `Nouveau dossier assigné`;
}

export interface CaseAssignedBySomeoneEmailProps {
  firstname: string;
  originatorFirstname: string;
  originatorLastname: string;
  caseUrl: string;
  caseHumanId: string;
}

export function CaseAssignedBySomeoneEmail(props: CaseAssignedBySomeoneEmailProps) {
  const title = formatTitle();

  return (
    <StandardLayout title={title}>
      <MjmlText>
        <h1>{title}</h1>
        <p>Bonjour {props.firstname},</p>
        <p>
          {props.originatorFirstname} {props.originatorLastname} vient de t&apos;assigner le dossier n°{props.caseHumanId}.
        </p>
      </MjmlText>
      <MjmlButton href={props.caseUrl}>Découvrir ce dossier</MjmlButton>
      <MjmlText></MjmlText>
    </StandardLayout>
  );
}
