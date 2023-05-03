import { createTRPCNextLayout } from '@trpc/next-layout';
import superjson from 'superjson';

import { getUser } from '@mediature/main/src/server-rsc/getUser';
import { appRouter } from '@mediature/main/src/server/app-router';
import { createContext } from '@mediature/main/src/server/context';

export const rsc = createTRPCNextLayout({
  router: appRouter,
  transformer: superjson,
  createContext() {
    return createContext({
      type: 'rsc',
      getUser,
    });
  },
});
