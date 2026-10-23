import * as Sentry from '@sentry/nextjs';

import { dbPool } from '@mediature/main/prisma/pool';
import { stopBossClientInstance } from '@mediature/main/src/server/queueing/client';

export async function gracefulExit(error?: Error) {
  if (error) {
    console.error(error);

    Sentry.captureException(error);
  }

  console.log('Exiting the application gracefully...');

  // Perform any necessary cleanup or finalization tasks here
  try {
    await Promise.all([stopBossClientInstance(), Sentry.close(2000)]);

    // Close the shared pool once pg-boss and any in-flight Prisma query no longer need it
    await dbPool.end();
  } finally {
    process.exit(error ? 1 : 0);
  }
}
