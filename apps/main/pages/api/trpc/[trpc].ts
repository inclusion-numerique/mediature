import { createNextApiHandler } from '@trpc/server/adapters/next';

import { appRouter } from '@mediature/main/server/app-router';
import { createContext } from '@mediature/main/server/context';

export default createNextApiHandler({
  router: appRouter,
  createContext(opts) {
    return createContext({
      type: 'api',
      ...opts,
    });
  },
  onError({ error }) {
    if (error.code === 'INTERNAL_SERVER_ERROR') {
      // send to bug reporting
      console.error('Something went wrong', error);
    }
  },
  batching: {
    enabled: true,
  },
});
