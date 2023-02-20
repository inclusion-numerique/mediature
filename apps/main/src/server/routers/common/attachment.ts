import { AttachmentStatus } from '@prisma/client';
import { diff } from 'fast-array-diff';

import { prisma } from '@mediature/main/prisma/client';
import { AttachmentKindSchemaType } from '@mediature/main/src/models/entities/attachment';

export interface SafeAttachmentsToProcess {
  markNewAttachmentsAsUsed: () => Promise<void>;
  attachmentsToAdd: string[];
  attachmentsToRemove: string[];
}

export async function formatSafeAttachmentsToProcess(
  attachmentKind: AttachmentKindSchemaType,
  inputAttachmentsIds: string[],
  existingAttachmentsIds: string[]
): Promise<SafeAttachmentsToProcess> {
  // Remove duplicates
  inputAttachmentsIds = [...new Set(inputAttachmentsIds)];
  existingAttachmentsIds = [...new Set(existingAttachmentsIds)];

  const { removed, added } = diff(existingAttachmentsIds, inputAttachmentsIds);

  if (added.length) {
    const existingAttachments = await prisma.attachment.findMany({
      where: {
        id: {
          in: inputAttachmentsIds,
        },
        kind: attachmentKind,
        status: AttachmentStatus.PENDING_UPLOAD,
      },
    });

    // If it does not match there are multiple possibilities, all suspicious:
    // - the user tries to bind a different kind of document (maybe to bypass upload restrictions)
    // - the user tries to bind a document already bound, it could be an attempt to "steal" another document by making it visible on the hacker's account
    if (existingAttachments.length !== inputAttachmentsIds.length) {
      throw new Error(`une erreur a été détecté concernant la transmission de documents`);
    }
  }

  return {
    attachmentsToAdd: added,
    attachmentsToRemove: removed,
    markNewAttachmentsAsUsed: added.length
      ? async () => {
          await prisma.attachment.updateMany({
            data: {
              status: AttachmentStatus.VALID,
            },
            where: {
              id: {
                in: added,
              },
            },
          });
        }
      : async () => {},
  };
}
