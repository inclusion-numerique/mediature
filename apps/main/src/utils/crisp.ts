import crypto from 'crypto';

const signingSecretKey = process.env.CRISP_SIGNING_SECRET_KEY;

if (!signingSecretKey) {
  throw new Error('you must provide a Crisp signing secret key');
}

export function signEmail(email: string): string {
  return crypto
    .createHmac('sha256', signingSecretKey as string)
    .update(email)
    .digest('hex');
}
