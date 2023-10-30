import { MessageError, MessageStatus } from '@prisma/client';
import PgBoss from 'pg-boss';
import { v4 as uuidv4 } from 'uuid';

import { prisma } from '@mediature/main/prisma';
import { mailer } from '@mediature/main/src/emails/mailer';
import { AttachmentKindSchema } from '@mediature/main/src/models/entities/attachment';
import { BusinessError } from '@mediature/main/src/models/entities/errors';
import { ProcessInboundMessageDataSchema, ProcessInboundMessageDataSchemaType } from '@mediature/main/src/models/jobs/case';
import { formatSafeAttachmentsToProcess, uploadFile } from '@mediature/main/src/server/routers/common/attachment';
import { attachmentKindList } from '@mediature/main/src/utils/attachment';
import { extractCaseHumanIdFromEmail } from '@mediature/main/src/utils/business/case';
import { decodeParseApiWebhookPayload } from '@mediature/main/src/utils/mailjet-mappers';

export const processInboundMessageTopic = 'process-inbound-message';

export async function processInboundMessage(job: PgBoss.Job<ProcessInboundMessageDataSchemaType>) {
  // TODO: DKIM inside the zod validation?
  const data = ProcessInboundMessageDataSchema.parse(job.data);

  const decodedPayload = await decodeParseApiWebhookPayload(data.emailPayload);

  // Match the recipients with one of the case
  const potentialCasesHumanIds: number[] = [];
  for (const toContact of decodedPayload.to) {
    const humanIdString = extractCaseHumanIdFromEmail(toContact.email);

    if (!!humanIdString) {
      potentialCasesHumanIds.push(parseInt(humanIdString, 10));
    }
  }

  const matchingCases = await prisma.case.findMany({
    where: {
      humanId: {
        in: potentialCasesHumanIds,
      },
    },
  });

  if (matchingCases.length === 0) {
    throw new BusinessError('caseRecipientRequired', `only emails about cases are allowed`);
  } else if (matchingCases.length > 5) {
    // It may happen an email targets multiple cases (probably cases of the same citizen)
    // But over 5 we consider it as spam since case emails are guessable and could be flooded
    throw new BusinessError('tooManyCaseRecipients', `the incoming email targets too many cases, which is not allowed`);
  } else if (matchingCases.length > 1) {
    // For multiple cases as recipients, our Mailjet partner will receive multiple times the same email content on different inboxes.
    // So it will trigger multiple times the webhook and to keep things simple we want to only consider one.
    // We chose to sort them and keep the one of the first recipient (otherwise we could have skipped if exact same message is already in the database but we wanted to avoid global lock and transaction)
    const humanIdString = extractCaseHumanIdFromEmail(decodedPayload.webhookTargetEmail);

    if (!!humanIdString) {
      const webhookTargetCaseHumanId = parseInt(humanIdString, 10);

      const orderedCasesHumanIds = matchingCases
        .map((matchingCase) => matchingCase.humanId)
        .sort(function (a, b) {
          return a - b;
        });

      if (webhookTargetCaseHumanId !== orderedCasesHumanIds[0]) {
        console.log(
          `we skip this incoming message to "${decodedPayload.webhookTargetEmail}" since it targets multiple cases. Only the webhook to the case n°${orderedCasesHumanIds[0]} for the same message is considered to avoid duplicates`
        );

        return;
      }
    }
  }

  const uploadedFiles: {
    id: string;
    inline: boolean;
  }[] = [];
  const rejectedFiles: {
    filename: string;
  }[] = [];
  for (const attachment of decodedPayload.attachments) {
    try {
      const fileId = await uploadFile({
        filename: attachment.filename || uuidv4(),
        contentType: attachment.contentType,
        kind: attachmentKindList[AttachmentKindSchema.Values.MESSAGE_DOCUMENT],
        file: attachment.content as Buffer, // TODO: casting here string it's always base64 to Buffer with Mailjet
      });

      uploadedFiles.push({
        id: fileId,
        inline: attachment.inline,
      });

      if (attachment.inline && attachment.inlineId) {
        // Replace the "cid" set by the sender by our own since the file is now stored on our end
        decodedPayload.content = decodedPayload.content.replace(`cid:${attachment.inlineId}`, `cid:${fileId}`);
      }
    } catch (error) {
      console.warn('an email attachment has not been persisted, we skip it to process the rest but we will notify both parts');
      console.error(error);

      rejectedFiles.push({
        filename: attachment.filename || 'noname',
      });
    }
  }

  const { attachmentsToAdd, markNewAttachmentsAsUsed } = await formatSafeAttachmentsToProcess(
    AttachmentKindSchema.Values.MESSAGE_DOCUMENT,
    uploadedFiles.map((file) => file.id),
    [],
    {
      // We do not really restrict the number of attachments since Mailjet limits
      // the size of the email to 15 MB. However we set still high limit in case someone
      // would just flood the system
      maxAttachmentsTotal: 100,
    }
  );

  // This is similar to the `sendMessage` tRPC endpoint
  const newMessage = await prisma.message.create({
    data: {
      subject: decodedPayload.subject,
      content: decodedPayload.content,
      status: MessageStatus.TRANSFERRED,
      errors: rejectedFiles.length > 0 ? [MessageError.REJECTED_ATTACHMENTS] : [],
      from: {
        connectOrCreate: {
          where: {
            email_name: {
              email: decodedPayload.from.email,
              name: decodedPayload.from.name || '',
            },
          },
          create: {
            email: decodedPayload.from.email,
            name: decodedPayload.from.name,
          },
        },
      },
      to: {
        create: decodedPayload.to.map((toContact) => {
          return {
            recipient: {
              connectOrCreate: {
                where: {
                  email_name: {
                    email: toContact.email,
                    name: toContact.name || '',
                  },
                },
                create: {
                  email: toContact.email,
                },
              },
            },
          };
        }),
      },
      MessagesOnCases: {
        createMany: {
          skipDuplicates: true,
          data: matchingCases.map((targetedCase) => {
            return {
              caseId: targetedCase.id,
              markedAsProcessed: false,
            };
          }),
        },
      },
      AttachmentsOnMessages: {
        createMany: {
          skipDuplicates: true,
          data: attachmentsToAdd.map((attachmentId) => {
            const uploadedFile = uploadedFiles.find((file) => {
              return file.id === attachmentId;
            });

            return {
              inline: uploadedFile ? uploadedFile.inline : false,
              attachmentId: attachmentId,
            };
          }),
        },
      },
    },
  });

  await markNewAttachmentsAsUsed();

  // Notify the originator of the missing file(s)
  if (rejectedFiles.length > 0) {
    try {
      await mailer.sendRejectedMessageFilesWarning({
        recipient: decodedPayload.from.email,
        rejectedFiles: rejectedFiles.map((file) => file.filename),
      });
    } catch (error) {
      console.warn('cannot notify the originator some of his files are missing, accepting this case to avoid consumption loop');
      console.error(error);
    }
  }

  console.log(`an inbound message has been processed, it targets the cases: ${matchingCases.map((targetedCase) => targetedCase.id).join(', ')}`);
}
