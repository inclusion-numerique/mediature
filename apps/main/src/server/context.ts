import * as trpc from '@trpc/server';
import * as trpcNext from '@trpc/server/adapters/next';
import { unstable_getServerSession } from 'next-auth';

import { nextAuthOptions } from '@mediature/main/src/pages/api/auth/[...nextauth]';
import { User, getUser } from '@mediature/main/src/server-rsc/getUser';

interface CreateContextOptions {
  user: User | null;
  rsc: boolean;
}

export async function createContextInner(opts: CreateContextOptions) {
  return {
    user: opts.user,
  };
}

export async function createContext(
  opts:
    | {
        type: 'rsc';
        getUser: typeof getUser;
      }
    | (trpcNext.CreateNextContextOptions & { type: 'api' })
) {
  if (opts.type === 'rsc') {
    // RSC
    return {
      type: opts.type,
      user: await opts.getUser(),
    };
  }

  // Not RSC
  const session = await unstable_getServerSession(opts.req, opts.res, nextAuthOptions);
  return {
    type: opts.type,
    user: session?.user,
  };
}

export type Context = trpc.inferAsyncReturnType<typeof createContext>;
