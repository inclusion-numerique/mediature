import { NextApiRequest, NextApiResponse } from 'next';

import { scheduleCronTasks } from '@mediature/main/src/server/queueing/schedule';
import { gracefulExit } from '@mediature/main/src/server/system';
import { apiHandlerWrapper } from '@mediature/main/src/utils/api';

let init = false;

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  // As of 2023 Next.js provides no way to launch a callback after startup (which is a shame)
  // so we are unable to schedule our cron tasks... Among lot of hacky solutions
  // we chose to trigger an endpoint at start thanks to the `Procfile` Heroku post-start process
  // even if not perfect, that's the only viable solution to benefit from shared environment variables,
  // database client, TypeScript... And in case you want to test it locally, just trigger the `/api/init` endpoint.
  //
  // Main related issue: https://github.com/vercel/next.js/discussions/15341

  if (!init) {
    init = true;

    try {
      // Register the event listener for termination signals
      process.on('SIGINT', gracefulExit);
      process.on('SIGTERM', gracefulExit);

      await scheduleCronTasks();

      console.log('All services have been initialized');
    } catch (error) {
      res.status(500).send('Failed to initialize some services');

      // Kill the process to be sure the host is aware of a critical failure that needs to be handled
      await gracefulExit(error as unknown as Error);
    }
  }

  res.send('Initialized');
}

export default apiHandlerWrapper(handler);
