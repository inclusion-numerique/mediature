/**
 * @jest-environment node
 */
import { prisma } from '@mediature/main/prisma/client';
import { parseApiWebhookPayload } from '@mediature/main/src/fixtures/mailjet/mailjet';
import { getServerTranslation } from '@mediature/main/src/i18n';
import { processInboundMessage } from '@mediature/main/src/server/queueing/workers/process-inbound-message';
import { getCaseEmail } from '@mediature/main/src/utils/business/case';

const describeWhenManual = process.env.TEST_MANUAL === 'true' ? describe : describe.skip;
const itWhenManual = process.env.TEST_MANUAL === 'true' ? it : it.skip;

describeWhenManual('processInboundMessage() worker', () => {
  it('send message to multiple cases', async () => {
    // Get existing cases to format the email
    const targetedCases = await prisma.case.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
      take: 2,
    });

    expect(targetedCases.length).toBe(2);

    const { t } = getServerTranslation('common');
    const caseEmail1 = getCaseEmail(t, targetedCases[0].humanId.toString());
    const caseEmail2 = getCaseEmail(t, targetedCases[1].humanId.toString());

    const deepCopyPayload: typeof parseApiWebhookPayload = JSON.parse(JSON.stringify(parseApiWebhookPayload));
    deepCopyPayload.Recipient = caseEmail1;
    deepCopyPayload.Headers.To = `Custom name 1 <${caseEmail1}>`;
    deepCopyPayload.Headers.Cc = `Custom name 2 <${caseEmail2}>`;

    // Simulate event publish, should not throw
    await processInboundMessage({
      id: '',
      name: '',
      data: {
        emailPayload: deepCopyPayload,
      },
    });
  }, 15000);
});
