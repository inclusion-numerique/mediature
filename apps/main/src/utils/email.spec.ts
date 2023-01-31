/**
 * @jest-environment node
 */
import nodemailer, { Transporter } from 'nodemailer';

import { MailcatcherContainer, setupMailcatcher } from '@mediature/main/src/utils/email';

describe('email', () => {
  let mailcatcher: MailcatcherContainer;
  let transporter: Transporter;

  beforeAll(async () => {
    mailcatcher = await setupMailcatcher();

    transporter = nodemailer.createTransport({
      host: mailcatcher.settings.host,
      port: mailcatcher.settings.port,
      auth: {
        user: mailcatcher.settings.user,
        pass: mailcatcher.settings.password,
      },
    });
  }, 30 * 1000);

  afterAll(async () => {
    if (transporter) {
      transporter.removeAllListeners();
      transporter.close();
    }

    if (mailcatcher) {
      await mailcatcher.container.stop();
    }
  });

  describe('send', () => {
    it('example', async () => {
      const info = await transporter.sendMail({
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to: 'bar@example.com, baz@example.com', // list of receivers
        subject: 'Hello ✔', // Subject line
        text: 'Hello world?', // plain text body
        html: '<b>Hello world?</b>', // html body
      });
    });
  });
});
