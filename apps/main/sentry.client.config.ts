import { Offline as OfflineIntegration } from '@sentry/integrations';
import * as Sentry from '@sentry/nextjs';
import SentryRRWeb from '@sentry/rrweb';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (process.env.NODE_ENV === 'production') {
  const hasReplays = true;
  const integrations: any[] = [new OfflineIntegration({})];

  if (hasReplays) {
    integrations.push(
      new SentryRRWeb({
        blockSelector: '[data-sentry-element-mask]',
        maskTextSelector: '[data-sentry-text-mask]',
      })
    );
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NEXT_PUBLIC_APP_MODE,
    debug: false,
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
    autoSessionTracking: true,
    integrations,
  });

  // Help to distinguish in the UI an extension resource is available
  Sentry.setTag('rrweb.active', hasReplays ? 'yes' : 'no');
}
