import { TRPCError, initTRPC } from '@trpc/server';
import superjson from 'superjson';

import { TokenUserSchema } from '@mediature/main/models/entities/user';
import { Context } from '@mediature/main/server/context';

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const router = t.router;

export const publicProcedure = t.procedure;

export const middleware = t.middleware;

export const mergeRouters = t.mergeRouters;

export const isAuthed = t.middleware(({ next, ctx }) => {
  // TODO: make sure it checks before entering the mdw, the expiration date of the JWT
  if (!ctx.user || !TokenUserSchema.parse(ctx.user)) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'vous devez être connecté pour effectuer cette action',
    });
  }

  return next({
    ctx: {
      // Infers the `user` as non-nullable
      user: ctx.user,
    },
  });
});

export const privateProcedure = t.procedure.use(isAuthed);
