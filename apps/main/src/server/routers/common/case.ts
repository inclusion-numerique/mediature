import { prisma } from '@mediature/main/prisma/client';
import { DeleteCaseInboundEmailDataSchema } from '@mediature/main/src/models/jobs/case';
import { deleteCaseInboundEmailTopic } from '@mediature/main/src/server/queueing/workers/delete-case-inbound-email';

export interface DeletedCase {
  id: string;
  humanId: number;
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

// Deleting a case only cascades to its direct relations (notes, links to attachments and messages), so to really
// remove personal data (as stated in the privacy policy) we also delete the citizen, the messages and the attachments
// that are not linked to anything else anymore
export async function deleteCasesWithRelatedData(caseIds: string[]): Promise<DeletedCase[]> {
  if (caseIds.length === 0) {
    return [];
  }

  const deletedCases = await prisma.$transaction(
    async (tx) => {
      const cases = await tx.case.findMany({
        where: {
          id: {
            in: caseIds,
          },
        },
        select: {
          id: true,
          humanId: true,
          citizen: {
            select: {
              id: true,
              addressId: true,
              phoneId: true,
            },
          },
          AttachmentsOnCases: {
            select: {
              attachmentId: true,
            },
          },
          Note: {
            select: {
              AttachmentsOnCaseNotes: {
                select: {
                  attachmentId: true,
                },
              },
            },
          },
          MessagesOnCases: {
            select: {
              messageId: true,
            },
          },
        },
      });

      const targetedCaseIds = cases.map((iCase) => iCase.id);
      const citizens = cases.map((iCase) => iCase.citizen);
      const messageIds = unique(cases.flatMap((iCase) => iCase.MessagesOnCases.map((messageOnCase) => messageOnCase.messageId)));

      // A message could be linked to another case, in this case we keep it
      const messagesLinkedToOtherCases = await tx.messagesOnCases.findMany({
        where: {
          messageId: {
            in: messageIds,
          },
          caseId: {
            notIn: targetedCaseIds,
          },
        },
        select: {
          messageId: true,
        },
      });
      const messageIdsToKeep = new Set(messagesLinkedToOtherCases.map((messageOnCase) => messageOnCase.messageId));
      const messageIdsToDelete = messageIds.filter((messageId) => !messageIdsToKeep.has(messageId));

      const messages = await tx.message.findMany({
        where: {
          id: {
            in: messageIdsToDelete,
          },
        },
        select: {
          fromId: true,
          to: {
            select: {
              recipientId: true,
            },
          },
          AttachmentsOnMessages: {
            select: {
              attachmentId: true,
            },
          },
        },
      });

      const attachmentIds = unique([
        ...cases.flatMap((iCase) => iCase.AttachmentsOnCases.map((attachmentOnCase) => attachmentOnCase.attachmentId)),
        ...cases.flatMap((iCase) =>
          iCase.Note.flatMap((note) => note.AttachmentsOnCaseNotes.map((attachmentOnNote) => attachmentOnNote.attachmentId))
        ),
        ...messages.flatMap((message) => message.AttachmentsOnMessages.map((attachmentOnMessage) => attachmentOnMessage.attachmentId)),
      ]);
      const contactIds = unique(messages.flatMap((message) => [message.fromId, ...message.to.map((recipient) => recipient.recipientId)]));

      // Cascades to notes and to links with attachments and messages
      await tx.case.deleteMany({
        where: {
          id: {
            in: targetedCaseIds,
          },
        },
      });

      // Cascades to links with recipients and attachments
      await tx.message.deleteMany({
        where: {
          id: {
            in: messageIdsToDelete,
          },
        },
      });

      await tx.identityStamp.deleteMany({
        where: {
          ownerId: {
            in: citizens.map((citizen) => citizen.id),
          },
        },
      });

      await tx.citizen.deleteMany({
        where: {
          id: {
            in: citizens.map((citizen) => citizen.id),
          },
        },
      });

      await tx.address.deleteMany({
        where: {
          id: {
            in: citizens.flatMap((citizen) => (citizen.addressId ? [citizen.addressId] : [])),
          },
        },
      });

      await tx.phone.deleteMany({
        where: {
          id: {
            in: citizens.flatMap((citizen) => (citizen.phoneId ? [citizen.phoneId] : [])),
          },
        },
      });

      // Only the ones no longer linked to anything
      await tx.attachment.deleteMany({
        where: {
          id: {
            in: attachmentIds,
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
            none: {},
          },
        },
      });

      // Contacts are shared across messages (unique by email and name), so only the ones no longer used
      await tx.contact.deleteMany({
        where: {
          id: {
            in: contactIds,
          },
          MessagesAsSender: {
            none: {},
          },
          RecipientContactsOnMessages: {
            none: {},
          },
        },
      });

      return cases.map((iCase): DeletedCase => ({ id: iCase.id, humanId: iCase.humanId }));
    },
    {
      timeout: 60 * 1000, // Default is 5 seconds, which could be too short when deleting a batch of cases with lots of messages
    }
  );

  // Delete the virtual email addresses so people sending emails to them would receive a normal error from the provider
  // (without it, it would silently end nowhere since no existing case while passing the inbound endpoint)
  //
  // [IMPORTANT] Imported at runtime to avoid a circular import since the queueing client imports the workers that use this function
  const { getBossClientInstance } = await import('@mediature/main/src/server/queueing/client');
  const bossClient = await getBossClientInstance();

  // Inserted all at once so it cannot stop in the middle (the cases being already deleted, the remaining ones could not be retried)
  // Note: contrary to `send()`, `insert()` does not set a default delay when using backoff, so without it all retries would be immediate
  if (deletedCases.length > 0) {
    await bossClient.insert(
      deletedCases.map((deletedCase) => ({
        name: deleteCaseInboundEmailTopic,
        data: DeleteCaseInboundEmailDataSchema.parse({
          caseId: deletedCase.id,
          caseHumanId: deletedCase.humanId,
        }),
        retryLimit: 50,
        retryDelay: 1,
        retryBackoff: true,
      }))
    );
  }

  return deletedCases;
}
