import { MjmlButton, MjmlText } from '@luma-team/mjml-react';

import { StandardLayout } from '@mediature/ui/src/emails/layouts/standard';

export function formatTitle() {
  return `Demande de médiation reçue`;
}

export interface CaseRequestConfirmationEmailProps {
  firstname: string;
  lastname: string;
  caseHumanId: string;
  authorityName: string;
}

export function CaseRequestConfirmationEmail(props: CaseRequestConfirmationEmailProps) {
  const title = formatTitle();

  return (
    <StandardLayout title={title}>
      <MjmlText>
        <h1>{title}</h1>
        <p>
          {props.firstname} {props.lastname},
        </p>
        <p>
          Nous vous informons que la demande de médiation que vous venez de déposer a bien été prise en compte sous le numéro de dossier{' '}
          {props.caseHumanId}.
        </p>
        <p>Un médiateur de la collectivité {props.authorityName} vous contactera dans les prochains jours pour vous aider dans vos démarches.</p>
      </MjmlText>
    </StandardLayout>
  );
}
