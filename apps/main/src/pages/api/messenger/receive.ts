import { NextApiRequest, NextApiResponse } from 'next';

import { ProcessInboundMessageDataSchema } from '@mediature/main/src/models/jobs/case';
import { getBossClientInstance } from '@mediature/main/src/server/queueing/client';
import { processInboundMessageTopic } from '@mediature/main/src/server/queueing/workers/process-inbound-message';

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check the request comes from a valid partner (those credentials has been set at the webhook URL set up)
  if (!isAuthenticated(req.headers.authorization)) {
    console.log('someone is trying to trigger the message webhook without being authenticated');

    res.status(401).json({ error: true, message: `invalid authentication credentials` });
    res.end();
    return;
  }

  try {
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
  } catch (error) {
    console.error(error);

    // We simplify by using 500 instead of managing also 401...
    res.status(500).json({ error: true, message: `an error has occured while parsing the email payload` });
    res.end();
  }
}
