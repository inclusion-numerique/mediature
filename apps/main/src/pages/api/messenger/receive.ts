import createHttpError from 'http-errors';
import { NextApiRequest, NextApiResponse } from 'next';

import { ProcessInboundMessageDataSchema } from '@mediature/main/src/models/jobs/case';
import { getBossClientInstance } from '@mediature/main/src/server/queueing/client';
import { processInboundMessageTopic } from '@mediature/main/src/server/queueing/workers/process-inbound-message';
import { apiHandlerWrapper } from '@mediature/main/src/utils/api';

export const config = {
  api: {
    bodyParser: {
      // Avoid having the default body size limit of 1MB (`bodyParser.sizeLimit`)
      // Mailjet has a limit of 15MB for inbound messages so we set it a bit above to handle
      // the extra overhead of all attachments being base64-encoded by them (between 33%-37% more according to https://en.wikipedia.org/wiki/Base64)
      // (if a user sends to Mailjet above their 15MB limit, they will receive an email answer to notify them)
      sizeLimit: '50mb',
    },
  },
};

export function isAuthenticated(authorizationHeader?: string): boolean {
  if (!authorizationHeader) {
    return false;
  }

  const encodedCredentials = authorizationHeader.replace('Basic ', '');
  const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString('utf-8');
  const [username, password] = decodedCredentials.split(':');

  if (username === (process.env.MAILJET_WEBHOOK_AUTH_USERNAME || '') && password === (process.env.MAILJET_WEBHOOK_AUTH_PASSWORD || '')) {
    return true;
  }

  return false;
}

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check the request comes from a valid partner (those credentials has been set at the webhook URL set up)
  if (!isAuthenticated(req.headers.authorization)) {
    console.log('someone is trying to trigger the message webhook without being authenticated');

    throw new createHttpError.Unauthorized(`invalid authentication credentials`);
  }

  // [WORKAROUND] Between tests and real cases sometimes it's not an object,
  let bodyObject: object;
  if (typeof req.body === 'string') {
    bodyObject = JSON.parse(req.body);
  } else {
    bodyObject = req.body;
  }

  const bossClient = await getBossClientInstance();
  await bossClient.send(
    processInboundMessageTopic,
    ProcessInboundMessageDataSchema.parse({
      emailPayload: bodyObject,
    }),
    {
      retryLimit: 3,
      retryDelay: 5 * 60, // 5 minutes between each
    }
  );

  res.send('RECEIVED');
}

export default apiHandlerWrapper(handler);
