import { renderToMjml } from '@luma-team/mjml-react';
import mjml2html from 'mjml';
import nodemailer, { Transporter } from 'nodemailer';
import type { Options as MailOptions } from 'nodemailer/lib/mailer/index';

import {
  SignUpConfirmationEmail,
  formatTitle as SignUpConfirmationEmailFormatTitle,
  SignUpConfirmationEmailProps,
} from '@mediature/ui/src/emails/templates/sign-up-confirmation/email';
import { convertHtmlEmailToText } from '@mediature/ui/src/utils/email';

export interface EmailServerSettings {
  host: string;
  port: number;
  user: string;
  password: string;
}

export interface MailerOptions {
  defaultSender: string;
  smtp: EmailServerSettings;
  fallbackSmtp?: EmailServerSettings;
}

export interface SendOptions {
  sender?: string;
  recipients: string[];
  subject: string;
  emailComponent: JSX.Element;
  attachments?: unknown[];
}

export class Mailer {
  protected transporter: Transporter;
  protected fallbackTransporter: Transporter | null = null;

  constructor(options: MailerOptions) {
    this.transporter = nodemailer.createTransport({
      host: options.smtp.host,
      port: options.smtp.port,
      auth: {
        user: options.smtp.user,
        pass: options.smtp.password,
      },
    });

    if (options.fallbackSmtp) {
      this.fallbackTransporter = nodemailer.createTransport({
        host: options.fallbackSmtp.host,
        port: options.fallbackSmtp.port,
        auth: {
          user: options.fallbackSmtp.user,
          pass: options.fallbackSmtp.password,
        },
      });
    }
  }

  public close() {
    this.transporter.removeAllListeners();
    this.transporter.close();

    if (this.fallbackTransporter) {
      this.fallbackTransporter.removeAllListeners();
      this.fallbackTransporter.close();
    }
  }

  protected async send(options: SendOptions) {
    const mjmlHtmlContent = renderToMjml(options.emailComponent);
    const transformResult = mjml2html(mjmlHtmlContent);

    if (transformResult.errors) {
      for (const err of transformResult.errors) {
        throw err;
      }
    }

    const rawHtmlVersion = transformResult.html;
    const plaintextVersion = convertHtmlEmailToText(rawHtmlVersion);

    const parameters: MailOptions = {
      from: options.sender,
      to: options.recipients.join(','),
      subject: options.subject,
      html: rawHtmlVersion,
      text: plaintextVersion,
    };

    try {
      await this.transporter.sendMail(parameters);
    } catch (err) {
      console.error('the first attempt to send the email has failed');
      console.error(err);

      const retryTransporter = this.fallbackTransporter || this.transporter;

      try {
        await retryTransporter.sendMail(parameters);
      } catch (err) {
        console.error('the second attempt to send the email has failed');
        console.error(err);
      }
    }
  }

  public async sendSignUpConfirmation(parameters: SignUpConfirmationEmailProps & { recipient: string }) {
    await this.send({
      recipients: [parameters.recipient],
      subject: SignUpConfirmationEmailFormatTitle(),
      emailComponent: SignUpConfirmationEmail(parameters),
    });
  }
}

export const mailer = new Mailer({
  defaultSender: `Médiature <noreply@${process.env.MAILER_DEFAULT_DOMAIN || ''}>`,
  smtp: {
    host: process.env.MAILER_SMTP_HOST || '',
    port: process.env.MAILER_SMTP_PORT ? parseInt(process.env.MAILER_SMTP_PORT, 10) : 0,
    user: process.env.MAILER_SMTP_USER || '',
    password: process.env.MAILER_SMTP_PASSWORD || '',
  },
  fallbackSmtp: {
    host: process.env.MAILER_FALLBACK_SMTP_HOST || '',
    port: process.env.MAILER_FALLBACK_SMTP_PORT ? parseInt(process.env.MAILER_FALLBACK_SMTP_PORT, 10) : 0,
    user: process.env.MAILER_FALLBACK_SMTP_USER || '',
    password: process.env.MAILER_FALLBACK_SMTP_PASSWORD || '',
  },
});
