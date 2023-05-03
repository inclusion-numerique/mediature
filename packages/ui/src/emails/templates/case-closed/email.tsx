import { MjmlText } from '@luma-team/mjml-react';

import { StandardLayout } from '@mediature/ui/src/emails/layouts/standard';

export function formatTitle() {
  return `Nouveau statut pour votre demande de médiation`;
}

export interface CaseClosedEmailProps {
  firstname: string;
  lastname: string;
  caseHumanId: string;
  authorityName: string;
}

export function CaseClosedEmail(props: CaseClosedEmailProps) {
  const title = formatTitle();

  return (
    <StandardLayout title={title}>
      <MjmlText>
        <h1>{title}</h1>
        <p>
          {props.firstname} {props.lastname},
        </p>
        <p>
          Nous vous informons que votre demande de médiation n°{props.caseHumanId} avec la collectivité {props.authorityName} est maintenant
          considérée comme close.
        </p>
      </MjmlText>
    </StandardLayout>
  );
}
