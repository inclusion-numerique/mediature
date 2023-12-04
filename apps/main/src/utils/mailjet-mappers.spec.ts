/**
 * @jest-environment node
 */
import contentDisposition from 'content-disposition';
import { promises as fs } from 'fs';
import { JSDOM } from 'jsdom';
import path from 'path';

import { imageB64Data } from '@mediature/main/src/fixtures/image';
import { parseApiWebhookPayload } from '@mediature/main/src/fixtures/mailjet/mailjet';
import {
  convertHeadersToCaseInsensitiveHeaders,
  decodeParseApiWebhookPayload,
  deprecated_getUtf8PartContent,
  getUtf8PartContent,
  parseContentDispositionHeaderWithFallback,
  parseContentTypeHeaderWithFallback,
  removeQuotedReplyFromHtmlEmail,
} from '@mediature/main/src/utils/mailjet-mappers';

describe('decodeParseApiWebhookPayload()', () => {
  it('should return values with documentation example', async () => {
    const decodedPayload = await decodeParseApiWebhookPayload(parseApiWebhookPayload);

    expect(decodedPayload).toStrictEqual({
      webhookTargetEmail: 'passenger1@mailjet.com',
      from: {
        email: 'pilot@mailjet.com',
        name: 'Pilot',
      },
      to: [
        {
          email: 'passenger1@mailjet.com',
          name: null,
        },
        {
          email: 'passenger2@mailjet.com',
          name: 'Passenger 2',
        },
        {
          email: 'passenger3@mailjet.com',
          name: 'Passenger 3',
        },
        {
          email: 'passenger4@mailjet.com',
          name: 'Passenger 4',
        },
      ],
      subject: `Hey! It's Friday!`,
      content: `{\"root\":{\"children\":[{\"children\":[{\"detail\":0,\"format\":0,\"mode\":\"normal\",\"style\":\"\",\"text\":\"Hi,\",\"type\":\"text\",\"version\":1}],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"paragraph\",\"version\":1},{\"children\":[{\"detail\":0,\"format\":0,\"mode\":\"normal\",\"style\":\"\",\"text\":\"Important notice: it's Friday. Friday \",\"type\":\"text\",\"version\":1},{\"detail\":0,\"format\":2,\"mode\":\"normal\",\"style\":\"\",\"text\":\"afternoon\",\"type\":\"text\",\"version\":1},{\"detail\":0,\"format\":0,\"mode\":\"normal\",\"style\":\"\",\"text\":\", even!\",\"type\":\"text\",\"version\":1}],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"paragraph\",\"version\":1},{\"children\":[{\"detail\":0,\"format\":0,\"mode\":\"normal\",\"style\":\"\",\"text\":\"Have a \",\"type\":\"text\",\"version\":1},{\"detail\":0,\"format\":2,\"mode\":\"normal\",\"style\":\"\",\"text\":\"great\",\"type\":\"text\",\"version\":1},{\"detail\":0,\"format\":0,\"mode\":\"normal\",\"style\":\"\",\"text\":\" weekend!\",\"type\":\"text\",\"version\":1}],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"paragraph\",\"version\":1},{\"children\":[{\"detail\":0,\"format\":0,\"mode\":\"normal\",\"style\":\"\",\"text\":\"The Anonymous Friday Teller\",\"type\":\"text\",\"version\":1}],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"paragraph\",\"version\":1}],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"root\",\"version\":1}}`,
      attachments: [
        {
          contentType: 'image/jpeg',
          filename: 'imageSample.jpg',
          content: Buffer.from(imageB64Data, 'base64'),
          inline: false,
          inlineId: undefined,
        },
        {
          contentType: 'image/jpeg',
          filename: 'imageSample2.jpg',
          content: Buffer.from(imageB64Data, 'base64'),
          inline: false,
          inlineId: undefined,
        },
      ],
    });
  });

  it('should return values with real saved payload', async () => {
    const payloadString = await fs.readFile(path.resolve(__dirname, '../fixtures/mailjet/mailjet-real-payload.json'), 'utf-8');
    const deepCopyPayload: typeof parseApiWebhookPayload = JSON.parse(payloadString);

    const decodedPayload = await decodeParseApiWebhookPayload(deepCopyPayload);

    const redImageContent = await fs.readFile(path.resolve(__dirname, '../fixtures/mailjet/red_image.jpg'));
    const dummyPdfContent = await fs.readFile(path.resolve(__dirname, '../fixtures/mailjet/dummy.pdf'));

    expect(decodedPayload).toStrictEqual({
      webhookTargetEmail: 'dossier-61@mediature.incubateur.net',
      from: {
        email: 'thomas.rame@beta.gouv.fr',
        name: 'Thomas Ramé',
      },
      to: [
        {
          email: 'dossier-61@mediature.incubateur.net',
          name: 'Le médiateur',
        },
      ],
      subject: `Re: Un médiateur vous a écrit`,
      content: `{\"root\":{\"children\":[{\"children\":[{\"detail\":0,\"format\":0,\"mode\":\"normal\",\"style\":\"\",\"text\":\"Hola\",\"type\":\"text\",\"version\":1}],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"paragraph\",\"version\":1},{\"altText\":\"\",\"caption\":{\"editorState\":{\"root\":{\"children\":[],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"root\",\"version\":1}}},\"height\":0,\"maxWidth\":500,\"showCaption\":false,\"src\":\"cid:d9ff1540-cb1a-4d03-9c39-1a403ad97ee8@EURPRD10.PROD.OUTLOOK.COM\",\"type\":\"image\",\"version\":1,\"width\":0},{\"children\":[{\"detail\":0,\"format\":0,\"mode\":\"normal\",\"style\":\"\",\"text\":\"Cool red one.\",\"type\":\"text\",\"version\":1}],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"paragraph\",\"version\":1},{\"children\":[{\"detail\":0,\"format\":0,\"mode\":\"normal\",\"style\":\"\",\"text\":\"Now PDF\",\"type\":\"text\",\"version\":1}],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"paragraph\",\"version\":1},{\"children\":[{\"detail\":0,\"format\":0,\"mode\":\"normal\",\"style\":\"\",\"text\":\"Lalalalaa\",\"type\":\"text\",\"version\":1}],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"paragraph\",\"version\":1},{\"children\":[{\"detail\":0,\"format\":0,\"mode\":\"normal\",\"style\":\"\",\"text\":\"Heyyy still there!?\",\"type\":\"text\",\"version\":1}],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"paragraph\",\"version\":1}],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"root\",\"version\":1}}`,
      attachments: [
        {
          contentType: 'image/jpeg',
          filename: 'red_image.jpg',
          content: redImageContent,
          inline: true,
          inlineId: 'd9ff1540-cb1a-4d03-9c39-1a403ad97ee8@EURPRD10.PROD.OUTLOOK.COM',
        },
        {
          contentType: 'application/pdf',
          filename: 'dummy.pdf',
          content: dummyPdfContent,
          inline: false,
          inlineId: 'a933e432-f91f-4eda-bc26-7b8c7c2fe98a@EURPRD10.PROD.OUTLOOK.COM',
        },
      ],
    });
  });

  it('should return values with real payload containing multiple html parts', async () => {
    // We removed attachments even if we kept the same HTML content then above with `cid:xxxxx` image blocks (does not matter, we want to check the structure here)
    const payloadString = await fs.readFile(path.resolve(__dirname, '../fixtures/mailjet/mailjet-real-payload-multiple-html-parts.json'), 'utf-8');
    const deepCopyPayload: typeof parseApiWebhookPayload = JSON.parse(payloadString);

    const decodedPayload = await decodeParseApiWebhookPayload(deepCopyPayload);

    expect(decodedPayload.content).toStrictEqual(
      `{\"root\":{\"children\":[{\"children\":[{\"detail\":0,\"format\":0,\"mode\":\"normal\",\"style\":\"\",\"text\":\"Hola\",\"type\":\"text\",\"version\":1}],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"paragraph\",\"version\":1},{\"altText\":\"\",\"caption\":{\"editorState\":{\"root\":{\"children\":[],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"root\",\"version\":1}}},\"height\":0,\"maxWidth\":500,\"showCaption\":false,\"src\":\"cid:d9ff1540-cb1a-4d03-9c39-1a403ad97ee8@EURPRD10.PROD.OUTLOOK.COM\",\"type\":\"image\",\"version\":1,\"width\":0},{\"children\":[{\"detail\":0,\"format\":0,\"mode\":\"normal\",\"style\":\"\",\"text\":\"Cool red one.\",\"type\":\"text\",\"version\":1}],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"paragraph\",\"version\":1},{\"children\":[{\"detail\":0,\"format\":0,\"mode\":\"normal\",\"style\":\"\",\"text\":\"Now PDF\",\"type\":\"text\",\"version\":1}],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"paragraph\",\"version\":1},{\"children\":[{\"detail\":0,\"format\":0,\"mode\":\"normal\",\"style\":\"\",\"text\":\"Lalalalaa\",\"type\":\"text\",\"version\":1}],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"paragraph\",\"version\":1},{\"children\":[{\"detail\":0,\"format\":0,\"mode\":\"normal\",\"style\":\"\",\"text\":\"Heyyy still there!?\",\"type\":\"text\",\"version\":1}],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"paragraph\",\"version\":1}],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"root\",\"version\":1}}`
    );
  });

  it('should return values with real payload that has an invalid HTML part (unhandled, empty...)', async () => {
    // We removed attachments even if we kept the same HTML content then above with `cid:xxxxx` image blocks (does not matter, we want to check the structure here)
    const payloadString = await fs.readFile(path.resolve(__dirname, '../fixtures/mailjet/mailjet-real-payload-invalid-html-part.json'), 'utf-8');
    const deepCopyPayload: typeof parseApiWebhookPayload = JSON.parse(payloadString);

    const decodedPayload = await decodeParseApiWebhookPayload(deepCopyPayload);

    expect(decodedPayload.content).toStrictEqual(
      `{\"root\":{\"children\":[{\"children\":[{\"detail\":0,\"format\":0,\"mode\":\"normal\",\"style\":\"\",\"text\":\"Hola\",\"type\":\"text\",\"version\":1}],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"paragraph\",\"version\":1},{\"children\":[{\"detail\":0,\"format\":0,\"mode\":\"normal\",\"style\":\"\",\"text\":\"[cid:d9ff1540-cb1a-4d03-9c39-1a403ad97ee8@EURPRD10.PROD.OUTLOOK.COM]\",\"type\":\"text\",\"version\":1}],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"paragraph\",\"version\":1},{\"children\":[{\"detail\":0,\"format\":0,\"mode\":\"normal\",\"style\":\"\",\"text\":\"Cool red one.\",\"type\":\"text\",\"version\":1}],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"paragraph\",\"version\":1},{\"children\":[{\"detail\":0,\"format\":0,\"mode\":\"normal\",\"style\":\"\",\"text\":\"Now PDF\",\"type\":\"text\",\"version\":1}],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"paragraph\",\"version\":1},{\"children\":[{\"detail\":0,\"format\":0,\"mode\":\"normal\",\"style\":\"\",\"text\":\"Lalalalaa\",\"type\":\"text\",\"version\":1},{\"type\":\"linebreak\",\"version\":1}],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"paragraph\",\"version\":1}],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"root\",\"version\":1}}`
    );
  });

  it('should return values with real payload that has only one part being text since different payload structure', async () => {
    const payloadString = await fs.readFile(path.resolve(__dirname, '../fixtures/mailjet/mailjet-real-payload-one-part-text.json'), 'utf-8');
    const deepCopyPayload: typeof parseApiWebhookPayload = JSON.parse(payloadString);

    const decodedPayload = await decodeParseApiWebhookPayload(deepCopyPayload);

    expect(decodedPayload.content).toStrictEqual(
      `{\"root\":{\"children\":[{\"children\":[{\"detail\":0,\"format\":0,\"mode\":\"normal\",\"style\":\"\",\"text\":\"Hola\",\"type\":\"text\",\"version\":1}],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"paragraph\",\"version\":1},{\"children\":[{\"detail\":0,\"format\":0,\"mode\":\"normal\",\"style\":\"\",\"text\":\"Cool red one.\",\"type\":\"text\",\"version\":1}],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"paragraph\",\"version\":1},{\"children\":[{\"detail\":0,\"format\":0,\"mode\":\"normal\",\"style\":\"\",\"text\":\"Now PDF\",\"type\":\"text\",\"version\":1}],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"paragraph\",\"version\":1},{\"children\":[{\"detail\":0,\"format\":0,\"mode\":\"normal\",\"style\":\"\",\"text\":\"Lalalalaa\",\"type\":\"text\",\"version\":1}],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"paragraph\",\"version\":1}],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"root\",\"version\":1}}`
    );
  });

  it('should return values despite having an empty subject', async () => {
    const payloadString = await fs.readFile(path.resolve(__dirname, '../fixtures/mailjet/mailjet-real-payload-empty-subject.json'), 'utf-8');
    const deepCopyPayload: typeof parseApiWebhookPayload = JSON.parse(payloadString);

    const decodedPayload = await decodeParseApiWebhookPayload(deepCopyPayload);

    expect(decodedPayload.subject).toBe('');
  });

  it('should return values with real payload that has only one part being html since different payload structure', async () => {
    const payloadString = await fs.readFile(path.resolve(__dirname, '../fixtures/mailjet/mailjet-real-payload-one-part-html.json'), 'utf-8');
    const deepCopyPayload: typeof parseApiWebhookPayload = JSON.parse(payloadString);

    const decodedPayload = await decodeParseApiWebhookPayload(deepCopyPayload);

    expect(decodedPayload.content).toStrictEqual(
      `{\"root\":{\"children\":[{\"children\":[{\"detail\":0,\"format\":0,\"mode\":\"normal\",\"style\":\"\",\"text\":\"Hello,\",\"type\":\"text\",\"version\":1}],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"paragraph\",\"version\":1},{\"children\":[{\"detail\":0,\"format\":0,\"mode\":\"normal\",\"style\":\"\",\"text\":\"Just to say hi!\",\"type\":\"text\",\"version\":1}],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"paragraph\",\"version\":1},{\"children\":[{\"detail\":0,\"format\":0,\"mode\":\"normal\",\"style\":\"\",\"text\":\"Regards\",\"type\":\"text\",\"version\":1}],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"paragraph\",\"version\":1}],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"root\",\"version\":1}}`
    );
  });
});

describe('getUtf8PartContent()', () => {
  it('should work with utf-8 metadata charset', () => {
    const content = getUtf8PartContent('<html>\x68\x65\x6c\x6c\x6f</html>', {
      Headers: { 'Content-Type': ['text/html; charset=utf-8'], 'Content-Transfer-Encoding': ['quoted-printable'] },
      ContentRef: 'Html-part',
    });

    expect(content).toBe('<html>hello</html>');
  });

  it('should work with ISO-8859-15 metadata charset', () => {
    const content = getUtf8PartContent('<html>hello</html>', {
      Headers: { 'Content-Type': ['text/html; charset=ISO-8859-15'], 'Content-Transfer-Encoding': ['quoted-printable'] },
      ContentRef: 'Html-part',
    });

    expect(content).toBe('<html>hello</html>');
  });

  it('should prove mailjet has already decoded themselves to encode into utf-8', () => {
    const realIncomingPartContent = '<html>Réception</html>';
    const part = {
      Headers: { 'Content-Type': ['text/html; charset=ISO-8859-15'], 'Content-Transfer-Encoding': ['quoted-printable'] },
      ContentRef: 'Html-part',
    };

    const contentConsideringMailjetDecoding = getUtf8PartContent(realIncomingPartContent, part);
    const wrongContentWithDoubleDecoding = deprecated_getUtf8PartContent(realIncomingPartContent, part);

    expect(contentConsideringMailjetDecoding).toBe('<html>Réception</html>');
    expect(wrongContentWithDoubleDecoding).toBe('<html>RÃ©ception</html>');
  });
});

describe('convertHeadersToCaseInsensitiveHeaders()', () => {
  it('should get the value', () => {
    const headers = convertHeadersToCaseInsensitiveHeaders({ 'helLo-cOntent': 'good' });

    expect(headers['Hello-Content']).toBe('good');
  });

  it('should work even if passing specific unicode characters', () => {
    // See comment of the definition to understand this
    const headers = convertHeadersToCaseInsensitiveHeaders({ a: 'Mail de l’assistante sociale' });

    expect(headers['a']).toBe('Mail de l’assistante sociale');
  });
});

describe('removeQuotedReplyFromHtmlEmail()', () => {
  const serverJsdom = new JSDOM();

  it('should remove the blockquote (for Outlook and others)', async () => {
    const emailString = await fs.readFile(path.resolve(__dirname, '../fixtures/mailjet/mailjet-real-email.html'), 'utf-8');

    const cleanEmailString = removeQuotedReplyFromHtmlEmail(emailString, serverJsdom);

    expect(cleanEmailString).not.toContain('<blockquote');
  });

  it('should remove the blockquote (for Gmail)', async () => {
    const emailString = await fs.readFile(path.resolve(__dirname, '../fixtures/mailjet/mailjet-real-gmail-email.html'), 'utf-8');

    const cleanEmailString = removeQuotedReplyFromHtmlEmail(emailString, serverJsdom);

    expect(cleanEmailString).not.toContain('<blockquote');
    expect(cleanEmailString).not.toContain('wrote');
  });
});

describe('parseContentDispositionHeaderWithFallback()', () => {
  it('should use the fallback to wrap filename value and pass the parsing', async () => {
    const contentDispositionObject = parseContentDispositionHeaderWithFallback('attachment; size=100; filename=aaa - bbb - ccc.pdf');

    expect(contentDispositionObject).toEqual({
      type: 'attachment',
      parameters: { size: '100', filename: 'aaa - bbb - ccc.pdf' },
    });
  });

  it('should use the fallback to wrap filename value and pass the parsing while escaping quotes', async () => {
    const contentDispositionObject = parseContentDispositionHeaderWithFallback('attachment; filename=aaa - bb""b - c""cc.pdf; size=100');

    expect(contentDispositionObject).toEqual({
      type: 'attachment',
      parameters: { size: '100', filename: 'aaa - bb""b - c""cc.pdf' },
    });
  });
});

describe('parseContentTypeHeaderWithFallback()', () => {
  it('should use the fallback to wrap filename value and pass the parsing', async () => {
    const contentDispositionObject = parseContentTypeHeaderWithFallback('application/pdf; name=aaa - bbb - ccc.pdf');

    expect(contentDispositionObject).toEqual({
      type: 'application/pdf',
      parameters: { name: 'aaa - bbb - ccc.pdf' },
    });
  });

  it('should use the fallback to wrap filename value and pass the parsing while escaping quotes', async () => {
    const contentDispositionObject = parseContentTypeHeaderWithFallback('application/pdf; name=aaa - bb""b - c""cc.pdf');

    expect(contentDispositionObject).toEqual({
      type: 'application/pdf',
      parameters: { name: 'aaa - bb""b - c""cc.pdf' },
    });
  });
});

// describe('formatEmlFromMailetPayload()', () => {
//   it('aaa', async () => {
//     const payloadString = await fs.readFile(path.resolve(__dirname, '../fixtures/mailjet/mailjet-real-payload.json'), 'utf-8');
//     const jsonPayload: typeof parseApiWebhookPayload = JSON.parse(payloadString);
//     const decodedPayload = ParseApiWebhookPayloadSchema.parse(jsonPayload);

//     const expectedEmlString = await fs.readFile(path.resolve(__dirname, '../fixtures/mailjet/mailjet-raw-email.eml'), 'utf-8');

//     const emlString = await formatEmlFromMailetPayload(decodedPayload);

//     expect(emlString).toBe(expectedEmlString);
//   });
// });
