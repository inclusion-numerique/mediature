import { subYears } from 'date-fns';
import PgBoss from 'pg-boss';

import { prisma } from '@mediature/main/prisma';
import { deleteCasesWithRelatedData } from '@mediature/main/src/server/routers/common/case';

export const cleanExpiredCasesTopic = 'clean-expired-cases';

// As stated in the privacy policy, case data is kept 2 years maximum
export const caseRetentionYears = 2;

const batchSize = 50; // To not load too many cases with their relations at once

export async function cleanExpiredCases(job: PgBoss.Job<void>) {
  console.log('starting the job of cleaning expired cases');

  const expirationDate = subYears(new Date(), caseRetentionYears);
  let deletedCasesCount = 0;

  while (true) {
    const expiredCases = await prisma.case.findMany({
      where: {
        OR: [
          {
            // Closed for too long
            closedAt: {
              lte: expirationDate,
            },
          },
          {
            // No activity for too long, even if not closed (abandoned cases)
            updatedAt: {
              lte: expirationDate,
            },
            // A reminder set by an agent (upcoming or recent) means the case is still followed
            AND: [
              {
                OR: [
                  {
                    termReminderAt: null,
                  },
                  {
                    termReminderAt: {
                      lte: expirationDate,
                    },
                  },
                ],
              },
            ],
            Note: {
              none: {
                updatedAt: {
                  gt: expirationDate,
                },
              },
            },
            AttachmentsOnCases: {
              none: {
                attachment: {
                  createdAt: {
                    gt: expirationDate,
                  },
                },
              },
            },
            MessagesOnCases: {
              none: {
                message: {
                  updatedAt: {
                    gt: expirationDate,
                  },
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
      },
      take: batchSize,
    });

    if (expiredCases.length === 0) {
      break;
    }

    const deletedCases = await deleteCasesWithRelatedData(expiredCases.map((expiredCase) => expiredCase.id));
    deletedCasesCount += deletedCases.length;

    console.log(`expired cases deleted: ${deletedCases.map((deletedCase) => deletedCase.humanId).join(', ')}`);

    // It can happen if an agent deletes one of the cases in the meantime, those won't be listed again so it's not blocking
    if (deletedCases.length < expiredCases.length) {
      console.warn(
        `only ${deletedCases.length} of ${expiredCases.length} expired cases have been deleted, the others were probably deleted in the meantime`
      );
    }

    // Safety net to not loop forever if for whatever reason the listed cases cannot be deleted
    if (deletedCases.length === 0) {
      break;
    }
  }

  console.log(`the job of cleaning expired cases has completed and removed ${deletedCasesCount} cases`);
}
