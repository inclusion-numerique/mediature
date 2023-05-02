/**
 * @jest-environment node
 */
import { promises as fs } from 'fs';
import { JSDOM } from 'jsdom';
import path from 'path';

import { imageB64Data } from '@mediature/main/src/fixtures/image';
import { parseApiWebhookPayload } from '@mediature/main/src/fixtures/mailjet/mailjet';
import { decodeParseApiWebhookPayload, removeQuotedReplyFromHtmlEmail } from '@mediature/main/src/utils/mailjet-mappers';

describe('decodeParseApiWebhookPayload()', () => {
  it('should return values with documentation example', async () => {
    const decodedPayload = await decodeParseApiWebhookPayload(parseApiWebhookPayload);

    expect(decodedPayload).toStrictEqual({
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
      from: {
        email: 'thomas.rame@beta.gouv.fr',
        name: 'Thomas Ramé',
      },
      to: [
        {
          email: 'dossier-61@mediature.incubateur.net',
          name: 'John de Médiature',
        },
      ],
      subject: `Re: Un médiateur vous a écrit`,
      content: `{\"root\":{\"children\":[{\"children\":[{\"detail\":0,\"format\":0,\"mode\":\"normal\",\"style\":\"\",\"text\":\"Hola \",\"type\":\"text\",\"version\":1}],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"paragraph\",\"version\":1},{\"altText\":\"\",\"caption\":{\"editorState\":{\"root\":{\"children\":[],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"root\",\"version\":1}}},\"height\":0,\"maxWidth\":500,\"showCaption\":false,\"src\":\"cid:d9ff1540-cb1a-4d03-9c39-1a403ad97ee8@EURPRD10.PROD.OUTLOOK.COM\",\"type\":\"image\",\"version\":1,\"width\":0},{\"children\":[{\"detail\":0,\"format\":0,\"mode\":\"normal\",\"style\":\"\",\"text\":\"Cool red one.\",\"type\":\"text\",\"version\":1}],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"paragraph\",\"version\":1},{\"children\":[{\"detail\":0,\"format\":0,\"mode\":\"normal\",\"style\":\"\",\"text\":\"Now PDF\",\"type\":\"text\",\"version\":1}],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"paragraph\",\"version\":1},{\"children\":[{\"detail\":0,\"format\":0,\"mode\":\"normal\",\"style\":\"\",\"text\":\"Lalalalaa\",\"type\":\"text\",\"version\":1}],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"paragraph\",\"version\":1},{\"children\":[{\"detail\":0,\"format\":0,\"mode\":\"normal\",\"style\":\"\",\"text\":\"Heyyy still there!?\",\"type\":\"text\",\"version\":1}],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"paragraph\",\"version\":1}],\"direction\":null,\"format\":\"\",\"indent\":0,\"type\":\"root\",\"version\":1}}`,
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
});

describe('removeQuotedReplyFromHtmlEmail()', () => {
  const serverJsdom = new JSDOM();

  it('should remove the blockquote', async () => {
    const emailString = await fs.readFile(path.resolve(__dirname, '../fixtures/mailjet/mailjet-real-email.html'), 'utf-8');

    const cleanEmailString = removeQuotedReplyFromHtmlEmail(emailString, serverJsdom);

    expect(cleanEmailString).not.toContain('<blockquote');
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
