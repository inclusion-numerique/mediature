import { MessageStatus } from '@prisma/client';
import PgBoss from 'pg-boss';
import { v4 as uuidv4 } from 'uuid';

import { prisma } from '@mediature/main/prisma';
import { AttachmentKindSchema } from '@mediature/main/src/models/entities/attachment';
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
    throw new Error(`only emails about cases are allowed`);
  } else if (matchingCases.length > 1) {
    // It's really unlikely someone would tag 2 cases as recipients...
    // So we disable it for now to avoid someone spamming multiple emails since guessable
    throw new Error(`the incoming email targets multiple cases, which is not allowed`);
  }

  const targetedCase = matchingCases[0];

  const uploadedFiles: {
    id: string;
    inline: boolean;
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
      console.warn('an email attachment has not been persisted, we skip it to process the rest');
      console.error(error);
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
        create: {
          markedAsProcessed: false,
          case: {
            connect: {
              id: targetedCase.id,
            },
          },
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

  console.log(`an inbound message has been processed for the case ${targetedCase.id}`);
}
