/**
 * @jest-environment node
 */
import { promises as fs } from 'fs';
import { testApiHandler } from 'next-test-api-route-handler';
import path from 'path';

import { prisma } from '@mediature/main/prisma/client';
import { parseApiWebhookPayload } from '@mediature/main/src/fixtures/mailjet/mailjet';
import { getServerTranslation } from '@mediature/main/src/i18n';
import handler from '@mediature/main/src/pages/api/messenger/receive';
import { getCaseEmail } from '@mediature/main/src/utils/business/case';

const describeWhenManual = process.env.TEST_MANUAL === 'true' ? describe : describe.skip;
const itWhenManual = process.env.TEST_MANUAL === 'true' ? it : it.skip;

describeWhenManual('receive() handler', () => {
  let encodedCredentials: string;

  beforeAll(async () => {
    encodedCredentials = Buffer.from(`${process.env.MAILJET_WEBHOOK_AUTH_USERNAME}:${process.env.MAILJET_WEBHOOK_AUTH_PASSWORD}`).toString('base64');
  }, 30 * 1000);

  it('not passing the authentication guard', async () => {
    const wrongEncodedCredentials = Buffer.from(`aaa:bbb`).toString('base64');

    await testApiHandler({
      handler,
      requestPatcher: (req) =>
        (req.headers = {
          'content-type': 'application/json',
          authorization: `Basic ${wrongEncodedCredentials}`,
        }),
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          body: '',
        });

        expect(res.status).toBe(401);
      },
    });
  });

  it('payload mock from Mailjet documentation (manual local test that requires launched application)', async () => {
    await testApiHandler({
      handler,
      requestPatcher: (req) =>
        (req.headers = {
          'content-type': 'application/json',
          authorization: `Basic ${encodedCredentials}`,
        }),
      test: async ({ fetch }) => {
        // Get existing case to format the email
        const targetedCase = await prisma.case.findFirstOrThrow({
          orderBy: {
            updatedAt: 'desc',
          },
        });

        const { t } = getServerTranslation('common');
        const caseEmail = getCaseEmail(t, targetedCase.humanId.toString());

        const deepCopyPayload: typeof parseApiWebhookPayload = JSON.parse(JSON.stringify(parseApiWebhookPayload));
        deepCopyPayload.Headers.To = `Custom name <${caseEmail}>`;

        const res = await fetch({
          method: 'POST',
          body: JSON.stringify(deepCopyPayload),
        });

        const body = await res.text();

        expect(res.status).toBe(200);
        expect(body).toStrictEqual('RECEIVED');
      },
    });
  });

  it('real payload we saved (manual local test that requires launched application)', async () => {
    await testApiHandler({
      handler,
      requestPatcher: (req) =>
        (req.headers = {
          'content-type': 'application/json',
          authorization: `Basic ${encodedCredentials}`,
        }),
      test: async ({ fetch }) => {
        // Get existing case to format the email
        const targetedCase = await prisma.case.findFirstOrThrow({
          orderBy: {
            updatedAt: 'desc',
          },
        });

        const { t } = getServerTranslation('common');
        const caseEmail = getCaseEmail(t, targetedCase.humanId.toString());

        const payloadString = await fs.readFile(path.resolve(__dirname, '../../../fixtures/mailjet/mailjet-real-payload.json'), 'utf-8');

        const deepCopyPayload: typeof parseApiWebhookPayload = JSON.parse(payloadString);
        deepCopyPayload.Headers.To = `Custom name <${caseEmail}>`;

        const res = await fetch({
          method: 'POST',
          body: JSON.stringify(deepCopyPayload),
        });

        const body = await res.text();

        expect(res.status).toBe(200);
        expect(body).toStrictEqual('RECEIVED');
      },
    });
  });
});
