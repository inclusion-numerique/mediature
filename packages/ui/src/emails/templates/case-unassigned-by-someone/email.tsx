import { MjmlButton, MjmlText } from '@luma-team/mjml-react';

import { StandardLayout } from '@mediature/ui/src/emails/layouts/standard';

export function formatTitle() {
  return `Dossier désassigné`;
}

export interface CaseUnassignedBySomeoneEmailProps {
  firstname: string;
  originatorFirstname: string;
  originatorLastname: string;
  caseUrl: string;
  caseHumanId: string;
}

export function CaseUnassignedBySomeoneEmail(props: CaseUnassignedBySomeoneEmailProps) {
  const title = formatTitle();

  return (
    <StandardLayout title={title}>
      <MjmlText>
        <h1>{title}</h1>
        <p>Bonjour {props.firstname},</p>
        <p>
          {props.originatorFirstname} {props.originatorLastname} vient de te désassigner du dossier n°{props.caseHumanId}.
        </p>
      </MjmlText>
      <MjmlButton href={props.caseUrl}>Revoir ce dossier</MjmlButton>
      <MjmlText></MjmlText>
    </StandardLayout>
  );
}
