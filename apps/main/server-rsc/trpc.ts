import { createTRPCNextLayout } from '@trpc/next-layout';
import superjson from 'superjson';

import { getUser } from '@mediature/main/server-rsc/getUser';
import { appRouter } from '@mediature/main/server/app-router';
import { createContext } from '@mediature/main/server/context';

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
