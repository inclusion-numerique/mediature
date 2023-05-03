import { MjmlButton, MjmlText } from '@luma-team/mjml-react';

import { useServerTranslation } from '@mediature/main/src/i18n/index';
import { StandardLayout } from '@mediature/ui/src/emails/layouts/standard';

export function formatTitle() {
  return `Récapitulatif du médiateur`;
}

export interface LiteCase {
  citizenFirstname: string;
  citizenLastname: string;
  reminderAt: Date;
  caseUrl: string;
  caseHumanId: string;
}

export interface AgentActivitySumUpEmailProps {
  firstname: string;
  unassignedCasesNumber: number;
  casesWithReminderSoon: LiteCase[];
  authorityDashboardUrl: string;
}

export function AgentActivitySumUpEmail(props: AgentActivitySumUpEmailProps) {
  const { t } = useServerTranslation('common');
  const title = formatTitle();

  return (
    <StandardLayout title={title}>
      <MjmlText>
        <h1>{title}</h1>
        <p>Bonjour {props.firstname},</p>
        {props.unassignedCasesNumber > 0 && (
          <p
            dangerouslySetInnerHTML={{
              __html: t('email.template.AgentActivitySumUpEmail.casesNotAssigned', { count: props.unassignedCasesNumber }),
            }}
          />
        )}
        {props.casesWithReminderSoon.length > 0 && (
          <p>
            {t('email.template.AgentActivitySumUpEmail.followingCasesHaveReminder', { count: props.casesWithReminderSoon.length })}
            <ul>
              {props.casesWithReminderSoon.map((targetedCase) => {
                return (
                  <li key={targetedCase.caseHumanId}>
                    <span style={{ fontWeight: 'bold' }}>[{t('date.short', { date: targetedCase.reminderAt })}]</span> Dossier n°
                    {targetedCase.caseHumanId} de {targetedCase.citizenFirstname} {targetedCase.citizenLastname}{' '}
                    <a href={targetedCase.caseUrl}>(voir)</a>
                  </li>
                );
              })}
            </ul>
          </p>
        )}
      </MjmlText>
      <MjmlButton href={props.authorityDashboardUrl}>Accéder à la plateforme</MjmlButton>
      <MjmlText></MjmlText>
    </StandardLayout>
  );
}
