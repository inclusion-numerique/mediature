import { AttachmentStatus } from '@prisma/client';
import subDays from 'date-fns/subDays';
import PgBoss from 'pg-boss';

import { prisma } from '@mediature/main/prisma';

export const cleanPendingUploadsTopic = 'clean-pending-uploads';

export async function cleanPendingUploads(job: PgBoss.Job<void>) {
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
