import { MjmlButton, MjmlDivider, MjmlRaw, MjmlStyle, MjmlText } from '@luma-team/mjml-react';
import { PropsWithChildren } from 'react';

import { StandardLayout } from '@mediature/ui/src/emails/layouts/standard';

export function formatTitle() {
  return `Nouveau message pour votre dossier`;
}

export interface StandardLayoutProps {
  firstname: string;
  lastname: string;
  dossierIdentifier: string;
  htmlMessageContent: string;
  attachments?: string[]; // TODO
}

export function CaseMessageEmail(props: PropsWithChildren<StandardLayoutProps>) {
  const title = formatTitle();

  return (
    <StandardLayout title={title}>
      <MjmlText>
        <h1>{title}</h1>
        <p>
          Bonjour {props.firstname} {props.lastname},
        </p>
        <p>Votre médiateur vient d&apos;apporter une nouvelle réponse à votre dossier n°{props.dossierIdentifier}.</p>
        {!!props.attachments?.length && <p>Vous trouverez ci-joint à cet email {props.attachments.length} document(s).</p>}
      </MjmlText>
      <MjmlDivider />
      <MjmlText>
        <MjmlRaw>
          <div dangerouslySetInnerHTML={{ __html: props.htmlMessageContent }} />
        </MjmlRaw>
      </MjmlText>
      <MjmlDivider />
      <MjmlText>
        <p>À noter que vous pouvez apporter réponse directement en répondant à cet email.</p>
      </MjmlText>
    </StandardLayout>
  );
}
