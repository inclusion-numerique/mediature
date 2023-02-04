/**
 * @jest-environment node
 */
import { Mailer } from '@mediature/main/src/emails/mailer';
import { MailcatcherContainer, setupMailcatcher } from '@mediature/main/src/utils/email';

describe('email', () => {
  let mailcatcher: MailcatcherContainer;
  let mailer: Mailer;

  beforeAll(async () => {
    mailcatcher = await setupMailcatcher();

    mailer = new Mailer({
      defaultSender: 'Jean <noreply@derrien.fr>',
      smtp: {
        host: mailcatcher.settings.host,
        port: mailcatcher.settings.port,
        user: mailcatcher.settings.user,
        password: mailcatcher.settings.password,
      },
    });
  }, 30 * 1000);

  afterAll(async () => {
    if (mailer) {
      mailer.close();
    }

    if (mailcatcher) {
      await mailcatcher.container.stop();
    }
  });

  describe('send', () => {
    it('SignUpConfirmation', async () => {
      await mailer.sendSignUpConfirmation({
        recipient: 'albert@mail.com',
        firstname: 'Albert',
        signInUrl: 'http://localhost:8080/#',
      });
    });
  });

  describe('catcher', () => {
    it('should catch an email', async () => {
      // Since skipped no matter the settings it should not throw an error
      mailer = new Mailer({
        defaultSender: 'Jean <noreply@derrien.fr>',
        smtp: {
          host: '',
          port: 10000,
          user: '',
          password: '',
        },
        domainsToCatch: ['domain.demo'],
      });

      await mailer.sendSignUpConfirmation({
        recipient: 'alice@domain.demo',
        firstname: 'Albert',
        signInUrl: 'http://localhost:8080/#',
      });
    });
  });
});
