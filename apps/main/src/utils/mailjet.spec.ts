/**
 * @jest-environment node
 */
import { mailjetClient } from '@mediature/main/src/utils/mailjet';

const describeWhenManual = process.env.TEST_MANUAL === 'true' ? describe : describe.skip;
const itWhenManual = process.env.TEST_MANUAL === 'true' ? it : it.skip;

// If you are willing to perform local test with a real Mailjet development account you need to use
// an URL pointing to your local running application. To do so you can simply use `localtunnel` or `ngrok`
// and just enter the URL into `.env.jest.local` as `MAILJET_WEBHOOK_DOMAIN=xxxxxxx`
//
// What's needed otherwise:
// - `MAILJET_WEBHOOK_DOMAIN`
// - `MAILJET_API_KEY`
// - `MAILJET_SECRET_KEY`
// - `MAILJET_WEBHOOK_AUTH_PASSWORD`
// - `MAILJET_WEBHOOK_AUTH_USERNAME`

describeWhenManual('Mailjet client (requires using a real Mailjet development account)', () => {
  // TODO: for now manual but could be retrieved from the DB (last updated case...)?
  const inboxEmail = 'dossier-61@mediature.incubateur.net';

  describe('createInboundEmail()', () => {
    it('should create the email inbox bound to the webhook url', async () => {
      await expect(mailjetClient.createInboundEmail(inboxEmail)).resolves.not.toThrow();
    });
  });

  describe('deleteInboundEmail()', () => {
    it('should delete the email inbox', async () => {
      await expect(mailjetClient.deleteInboundEmail(inboxEmail)).resolves.not.toThrow();
    });
  });
});
