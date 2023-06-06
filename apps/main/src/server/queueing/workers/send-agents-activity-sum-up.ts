import PgBoss from 'pg-boss';

import { prisma } from '@mediature/main/prisma';
import { mailer } from '@mediature/main/src/emails/mailer';
import { getDateStartingToBeSoon } from '@mediature/main/src/utils/business/reminder';
import { linkRegistry } from '@mediature/main/src/utils/routes/registry';

export const sendAgentsActivitySumUpTopic = 'send-agents-activity-sum-up';

export async function sendAgentsActivitySumUp(job: PgBoss.Job<void>) {
  if (process.env.APP_MODE !== 'prod') {
    console.log('skip the job of sending an activity sum up to all agents to not pollute their inboxes since not in production');
    return;
  }

  console.log('starting the job of sending an activity sum up to all agents');

  const agents = await prisma.agent.findMany({
    where: {},
    include: {
      user: true,
      CaseAssigned: {
        where: {
          termReminderAt: {
            not: null,
            lte: getDateStartingToBeSoon(),
          },
        },
        include: {
          citizen: true,
        },
      },
      authority: {
        include: {
          Case: {
            where: {
              agentId: null,
            },
          },
        },
      },
    },
  });

  // TODO: we could use a library to retry for a failing sending or skip it to not
  // TODO: bind to Sentry to get notified of errors
  let count = 0;
  for (const agent of agents) {
    if (agent.authority.Case.length > 0 || agent.CaseAssigned.length > 0) {
      count++;

      await mailer.sendAgentActivitySumUp({
        recipient: agent.user.email,
        firstname: agent.user.firstname,
        unassignedCasesNumber: agent.authority.Case.length,
        casesWithReminderSoon: agent.CaseAssigned.map((caseWithReminderSoon) => {
          return {
            citizenFirstname: caseWithReminderSoon.citizen.firstname,
            citizenLastname: caseWithReminderSoon.citizen.lastname,
            reminderAt: caseWithReminderSoon.termReminderAt || new Date(),
            caseUrl: linkRegistry.get(
              'case',
              {
                authorityId: caseWithReminderSoon.authorityId,
                caseId: caseWithReminderSoon.id,
              },
              { absolute: true }
            ),
            caseHumanId: caseWithReminderSoon.humanId.toString(),
          };
        }),
        authorityDashboardUrl: linkRegistry.get('authority', { authorityId: agent.authorityId }, { absolute: true }),
      });
    }
  }

  console.log(`the job of sending an activity sum up to all agents has completed and notified ${count} agents`);
}
