import { AttachmentStatus } from '@prisma/client';
import subDays from 'date-fns/subDays';

import { prisma } from '@mediature/main/prisma';
import { mailer } from '@mediature/main/src/emails/mailer';
import { getDateStartingToBeSoon } from '@mediature/main/src/utils/business/reminder';
import { linkRegistry } from '@mediature/main/src/utils/routes/registry';

export async function cleanPendingUploads() {
  console.log('starting the job of cleaning pending uploads');

  const deletedAttachments = await prisma.attachment.deleteMany({
    where: {
      createdAt: {
        // Wait 7 days just for temporary file to be seen with valid link but also investigated
        lte: subDays(new Date(), 7),
      },
      status: {
        not: AttachmentStatus.VALID,
      },
      Authority: {
        is: null,
      },
      AttachmentsOnCases: {
        is: null,
      },
      AttachmentsOnCaseNotes: {
        is: null,
      },
      AttachmentsOnMessages: {
        // Look for no relation
        none: {},
      },
    },
  });

  console.log(`the job of cleaning pending uploads has completed and removed ${deletedAttachments.count} attachments`);
}

export async function sendAgentsActivitySumUp() {
  if (process.env.APP_MODE !== 'prod') {
    console.log('skip the job of sending an activity sum up to all agents to not pollute their inboxes since not in production');
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
