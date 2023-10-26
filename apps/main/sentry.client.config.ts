import { Offline as OfflineIntegration } from '@sentry/integrations';
import * as Sentry from '@sentry/nextjs';
import SentryRRWeb from '@sentry/rrweb';

import { dsn, environment, release } from '@mediature/main/src/utils/sentry';

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
  dsn: dsn,
  environment: environment,
  debug: false,
  release: release,
  autoSessionTracking: true,
  integrations,
});

// Help to distinguish in the UI an extension resource is available
Sentry.setTag('rrweb.active', hasReplays ? 'yes' : 'no');
