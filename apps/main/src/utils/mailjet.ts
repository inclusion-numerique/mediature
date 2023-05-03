import mailjet, { Client } from 'node-mailjet';

export interface MailjetOptions {
  apiKey: string;
  secretKey: string;
  webhookBaseUrl: string;
  webhookAuthUsername: string;
  webhookAuthPassword: string;
}

export interface MailjetInterface {
  createInboundEmail(email: string): Promise<void>;
  deleteInboundEmail(email: string): Promise<void>;
}

export class Mailjet {
  protected client: Client;
  protected webhookBaseUrl: string;
  protected webhookAuthUsername: string;
  protected webhookAuthPassword: string;

  constructor(options: MailjetOptions) {
    this.client = mailjet.apiConnect(options.apiKey, options.secretKey);
    this.webhookBaseUrl = options.webhookBaseUrl;
    this.webhookAuthUsername = options.webhookAuthUsername;
    this.webhookAuthPassword = options.webhookAuthPassword;
  }

  public async createInboundEmail(email: string): Promise<void> {
    const url = new URL(`${this.webhookBaseUrl}/receive`);

    // Add credentials if any
    url.username = this.webhookAuthUsername;
    url.password = this.webhookAuthPassword;

    const result = await this.client.post('parseroute').request({
      Email: email,
      Url: url.toString(),
    });
  }

  public async deleteInboundEmail(email: string): Promise<void> {
    const result = await this.client.delete('parseroute').id(email).request();
  }
}

export class MailjetMock {
  constructor() {
    console.log('the Mailjet client is initialized as a mock');
  }

  public async createInboundEmail(email: string): Promise<void> {
    console.log('the Mailjet client is mocked so no inbound email will be created');
  }

  public async deleteInboundEmail(email: string): Promise<void> {
    console.log('the Mailjet client is mocked so no inbound email will be deleted');
  }
}

const webhookDomain: string = process.env.MAILJET_WEBHOOK_DOMAIN || process.env.MAILER_DEFAULT_DOMAIN || '';

export const mailjetClient: MailjetInterface =
  process.env.MAILJET_CLIENT_MOCK === 'true'
    ? new MailjetMock()
    : new Mailjet({
        apiKey: process.env.MAILJET_API_KEY || '',
        secretKey: process.env.MAILJET_SECRET_KEY || '',
        webhookBaseUrl: `https://${webhookDomain}/api/messenger`,
        webhookAuthUsername: process.env.MAILJET_WEBHOOK_AUTH_USERNAME || '',
        webhookAuthPassword: process.env.MAILJET_WEBHOOK_AUTH_PASSWORD || '',
      });
