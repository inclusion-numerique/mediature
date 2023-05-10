import contentDisposition from 'content-disposition';
import contentType from 'content-type';
import emailAddressUtil from 'email-addresses';
import EmailReplyParser from 'email-reply-parser';
import he from 'he';
import { JSDOM } from 'jsdom';
import { createMimeMessage } from 'mimetext';
import z from 'zod';

import { Attachment as EmailAttachment } from '@mediature/main/src/emails/mailer';
import { EditorStateSchemaType } from '@mediature/main/src/models/entities/lexical';
import { ContactInputSchema, ContactInputSchemaType } from '@mediature/main/src/models/entities/messenger';
import { quotedReplyMarkerClass } from '@mediature/ui/src/emails/layouts/standard';
import { inlineEditorStateFromHtml } from '@mediature/ui/src/utils/lexical';

const serverJsdom = new JSDOM();

export interface ReceivedMessage {
  from: ContactInputSchemaType;
  to: ContactInputSchemaType[];
  subject: string;
  content: EditorStateSchemaType;
  attachments: EmailAttachment[];
}

export const ParseApiWebhookPayloadSchema = z
  .object({
    From: z.string().min(1),
    Recipient: z.string().min(1),
    Subject: z.string().min(1),
    Parts: z
      .array(
        z.object({
          Headers: z.record(
            z.string().min(1),
            z
              .string()
              .min(0)
              .or(z.array(z.string().min(0)))
          ),
          ContentRef: z.string().min(1).nullish(),
        })
      )
      .min(1),
    Headers: z.record(
      z.string().min(1),
      z
        .string()
        .min(0)
        .or(z.array(z.string().min(0)))
    ),
    SpamAssassinScore: z.coerce.number(),
  })
  .catchall(z.string().nullish())
  .required()
  .strict()
  .superRefine((data, ctx) => {
    if (data) {
      // TODO: check DKIM? (use https://www.npmjs.com/package/mailauth)
      // Note: after talking to the Mailjet support they said they do not check SPF/DKIM/DMARC on their own before notifying us
      // of the message. They mentioned the initial purpose of their feature is not to mimic emailing that's why. Our main issue for now
      // is to perform "JSON -> EML" to rebuild DKIM signature and so. Since it's character sensitive (double space, tabulation, encoding...),
      // having Mailjet not sharing a sample or their JSON builder does not help. Let's continue without those checks for now

      for (const part of data.Parts) {
        // Some parts are just metadata (like boundary string...), we can skip them
        if (!part.ContentRef) {
          continue;
        }

        if (typeof (data as any)[part.ContentRef] !== 'string') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'each part of the email must be included when specified into the "Parts" object',
          });
        }

        if (!part.Headers['Content-Type']) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'each part should have a "Content-Type" header',
          });
        }
      }
    }
  });
export type ParseApiWebhookPayloadSchemaType = z.infer<typeof ParseApiWebhookPayloadSchema>;

export async function decodeParseApiWebhookPayload(jsonPayload: object): Promise<ReceivedMessage> {
  const decodedPayload = ParseApiWebhookPayloadSchema.parse(jsonPayload);
  const headers = convertToCompatibleHeaders(decodedPayload.Headers);

  const toContacts: ContactInputSchemaType[] = [];

  for (const recipientsHeaderKey of ['To', 'Cc', 'Bcc']) {
    const recipientsHeader = headers.get(recipientsHeaderKey);

    if (recipientsHeader) {
      const results = emailAddressUtil.parseAddressList(recipientsHeader);

      if (results) {
        for (const result of results) {
          const email = z
            .string()
            .email()
            .parse((result as any).address);

          const contact = ContactInputSchema.parse({
            email: email,
            name: result.name,
          });

          if (
            !!toContacts.find((toContact) => {
              return toContact.email === contact.email && toContact.name === contact.name;
            })
          ) {
            // If already existing, skip
            break;
          }

          toContacts.push(contact);
        }
      }
    }
  }

  if (toContacts.length === 0) {
    throw new Error('at least a recipient must be specified');
  }

  const fromResult = emailAddressUtil.parseOneAddress(decodedPayload.From);
  if (!fromResult) {
    throw new Error('a sender must be specified');
  }

  const fromEmail = z
    .string()
    .email()
    .parse((fromResult as any).address);

  const fromContact: ContactInputSchemaType = {
    email: fromEmail,
    name: fromResult?.name,
  };

  let htmlContentToProcess: string | null = null;

  // Take the HTML part in priority and text as fallback
  const htmlPart = decodedPayload.Parts.find((part) => part.ContentRef === 'Html-part');
  if (htmlPart && htmlPart.ContentRef) {
    const htmlPartContent = decodedPayload[htmlPart.ContentRef];

    if (htmlPartContent) {
      const cleanHtmlPartContent = removeQuotedReplyFromHtmlEmail(htmlPartContent, serverJsdom);

      htmlContentToProcess = cleanHtmlPartContent;
    } else {
      const textPart = decodedPayload.Parts.find((part) => part.ContentRef === 'Text-part');

      if (textPart && textPart.ContentRef) {
        const textPartContent = decodedPayload[textPart.ContentRef];

        if (textPartContent) {
          // Remove the quoted previous messages to only keep new content
          const cleanTextPartContent = new EmailReplyParser().read(textPartContent).getVisibleText();

          // First escape the text to avoid raw characters like "<, >, &"
          const sanitizedTextContent = he.escape(cleanTextPartContent);

          // Then try to infer paragraphs and set appropriate tags
          // Inspired by https://stackoverflow.com/a/45658944/3608410
          htmlContentToProcess = '<p>' + sanitizedTextContent.replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br>') + '</p>';
        }
      }
    }
  }

  if (!htmlContentToProcess) {
    throw new Error('impossible to get content from this email');
  }

  // Look for attachments
  const attachments: EmailAttachment[] = [];
  for (const part of decodedPayload.Parts) {
    // Mailjet will always forward attachments in the base64 format
    const partHeaders = convertToCompatibleHeaders(part.Headers);

    const contentTypeHeader = partHeaders.get('Content-Type');
    const contentDispositionHeader = partHeaders.get('Content-Disposition');

    if (
      part.ContentRef &&
      contentTypeHeader &&
      contentDispositionHeader &&
      partHeaders.get('Content-Transfer-Encoding') === 'base64' &&
      typeof decodedPayload[part.ContentRef] === 'string'
    ) {
      const contentTypeObject = contentType.parse(contentTypeHeader);
      const contentDispositionObject = contentDisposition.parse(contentDispositionHeader);

      const filename = contentDispositionObject.parameters.filename || undefined;

      // Remove chevrons to ease post-process since it's formatted `<XXX>`
      const contentIdHeader = partHeaders.get('Content-Id');
      const cleanedContentId: string | undefined = contentIdHeader ? contentIdHeader.replace(/<|>/g, '') : undefined;

      attachments.push({
        contentType: contentTypeObject.type,
        filename: filename,
        content: Buffer.from(decodedPayload[part.ContentRef] as string, 'base64'),
        inline: contentDispositionObject.type === 'inline' && !!cleanedContentId,
        inlineId: cleanedContentId,
      });
    }
  }

  const content = await inlineEditorStateFromHtml(htmlContentToProcess, serverJsdom);

  return {
    from: fromContact,
    to: toContacts,
    subject: decodedPayload.Subject,
    content: content,
    attachments: attachments,
  };
}

export function convertToCompatibleHeaders(headers: Record<string, string | string[]>): Headers {
  return convertHeadersMapToHeaders(removeMailjetTabulationOnHeaders(stripHeadersToHaveStringAsValues(headers)));
}

// It makes getting headers not case-sensitive (which is important since it depends on the email sender server)
// (for example Outlook formats `Content-ID` instead of the expected `Content-Id` resulting in breaking if accessing as object properties)
export function convertHeadersMapToHeaders(headers: Record<string, string | string[]>): Headers {
  return new Headers(stripHeadersToHaveStringAsValues(headers));
}

// TODO: was it only inside the saved value because we stored it on the storage?
// maybe not needed when full memory... to check
// It should not be used before checking the DKIM signature because the difference could make things wrong
export function removeMailjetTabulationOnHeaders(headers: Record<string, string>): Record<string, string> {
  const cleanedHeaders: Record<string, string> = {};

  for (const key in headers) {
    cleanedHeaders[key] = headers[key].replace(/\t/g, ' ');
  }

  return cleanedHeaders;
}

export function stripHeadersToHaveStringAsValues(headers: Record<string, string | string[]>): Record<string, string> {
  const cleanedHeaders: Record<string, string> = {};

  for (const key in headers) {
    const value = headers[key];

    if (Array.isArray(value) && value.length === 1) {
      cleanedHeaders[key] = value[0];
    } else if (typeof value === 'string') {
      cleanedHeaders[key] = value;
    } else if (!['Received', 'X-MS-Exchange-CrossTenant-RMS-PersistedConsumerOrg'].includes(key)) {
      // No warning if it's a transport header
      console.warn(`header "${key}" does not have exactly 1 value, we skip it but it needs to be investigated`);
    }
  }

  return cleanedHeaders;
}

// TODO: too many differencies and complications to format...
// this will probably never match the original EML source so it's useless
// Another try can be done with https://github.com/emailjs/emailjs-mime-builder
export function formatEmlFromMailetPayload(payload: ParseApiWebhookPayloadSchemaType): string {
  const message = createMimeMessage();

  const headers = convertToCompatibleHeaders(payload.Headers);
  message.setHeaders(Object.fromEntries(headers.entries()));

  for (const part of payload.Parts) {
    const partHeaders = convertToCompatibleHeaders(part.Headers);

    const contentTypeHeader = partHeaders.get('Content-Type');
    const contentDispositionHeader = partHeaders.get('Content-Disposition');

    if (part.ContentRef && typeof payload[part.ContentRef] === 'string' && contentTypeHeader) {
      const typeObject = contentType.parse(contentTypeHeader);

      if (['text/plain', 'text/html'].includes(typeObject.type)) {
        message.addMessage({
          contentType: contentTypeHeader,
          data: payload[part.ContentRef] as string,
          headers: Object.fromEntries(partHeaders.entries()),
        });
      } else if (contentDispositionHeader) {
        const contentDispositionObject = contentDisposition.parse(contentDispositionHeader);

        message.addAttachment({
          contentType: contentTypeHeader,
          filename: contentDispositionObject.parameters.filename,
          data: payload[part.ContentRef] as string,
          headers: Object.fromEntries(partHeaders.entries()),
          inline: contentDispositionObject.type === 'inline',
        });
      }
    }
  }

  return message.asRaw();
}

// `jsdomInstance` is required on the server to use the DOM API
export function removeQuotedReplyFromHtmlEmail(htmlContent: string, jsdomInstance?: JSDOM): string {
  // It's quite hard to remove quoted reply with HTML emails because each email clients use total different formats. For example:
  // - Outlook: quite easy, they have a big `<blockquote>` with a text pattern inside like for plain text emails
  // - Gmail: harder, they have a big `<blockquote>` but the text pattern seems to be outside with an additional `<hr>`
  // - ... and many more ways :)
  //
  // We don't pretend to do something clean for all. First of all the best bet for now for us is people won't write into our our email template
  // to answer so we can "safely" say we can remove our original email. To do so we delimit our content by a HTML class allowing us to remove the HTML node.
  // It's not perfect but will at least avoid saving a new time 95% of the quoted reply content (and resulting in formatting issue in our messenger).
  //
  // Note: we gave up using kind of sentence like `##- Please type your reply above this line -##` that is visible when people receives our messages.
  // For only support conversations it could make sense but we want the final users to be able to reply to all emails related to a specific case,
  // so having this visible on top on each email would be weird.
  let parser: DOMParser;

  if (jsdomInstance) {
    parser = new jsdomInstance.window.DOMParser();
  } else {
    parser = new DOMParser();
  }

  const dom = parser.parseFromString(htmlContent, 'text/html');

  // Some browser clients prefix or suffix the class names when they move the content as "quoted reply"
  const elements = dom.querySelectorAll(`[class*="${quotedReplyMarkerClass}"]`);
  for (const element of elements) {
    const parentBlockquoteElement = element.closest('blockquote');
    const parentElement = element.parentElement;

    if (parentBlockquoteElement) {
      // Email clients are likely to wrap the "quoted reply" in a `blockquote` tag
      // so we focus on it because it probably has some metadata text into it
      parentBlockquoteElement.remove();
    } else if (parentElement) {
      // It's likely the content is wrapped into a single node by the email client
      // (also, from the start we cannot set the marker class to the highest node we send)
      parentElement.remove();
    } else {
      element.remove();
    }
  }

  return dom.documentElement.innerHTML;
}