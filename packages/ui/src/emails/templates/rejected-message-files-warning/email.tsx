import { MjmlText } from '@luma-team/mjml-react';

import { useServerTranslation } from '@mediature/main/src/i18n';
import { StandardLayout } from '@mediature/ui/src/emails/layouts/standard';

export function formatTitle() {
  return `Erreur suite à l'envoi de votre message`;
}

export interface RejectedMessageFilesWarningEmailProps {
  rejectedFiles: string[];
}

export function RejectedMessageFilesWarningEmail(props: RejectedMessageFilesWarningEmailProps) {
  const { t } = useServerTranslation('common');
  const title = formatTitle();

  return (
    <StandardLayout title={title}>
      <MjmlText>
        <h1>{title}</h1>
        <p>Bonjour,</p>
        <p>
          {t('email.template.RejectedMessageFilesWarning.cannotPersistFiles', { count: props.rejectedFiles.length })}
          <ul>
            {props.rejectedFiles.map((rejectedFile) => {
              return <li key={rejectedFile}>{rejectedFile}</li>;
            })}
          </ul>
        </p>
        <p>
          Il peut s&apos;agir d&apos;une erreur temporaire ou bien d&apos;un type de fichier que la plateforme ne prend pas en charge. Veuillez faire
          part de votre problème au médiateur si besoin.
        </p>
      </MjmlText>
    </StandardLayout>
  );
}
