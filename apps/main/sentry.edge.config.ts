import * as Sentry from '@sentry/nextjs';

import { dsn, environment, release } from '@mediature/main/src/utils/sentry';

const integrations: any[] = [];

Sentry.init({
  dsn: dsn,
  environment: environment,
  debug: false,
  release: release,
  autoSessionTracking: true,
  integrations,
});
