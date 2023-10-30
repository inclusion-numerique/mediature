import { TRPCError, initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';

import { CustomError, internalServerErrorError } from '@mediature/main/src/models/entities/errors';
import { TokenUserSchema } from '@mediature/main/src/models/entities/user';
import { Context } from '@mediature/main/src/server/context';

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter(opts) {
    const { shape, error } = opts;

    let acceptableZodError = error.cause instanceof ZodError && error.code === 'BAD_REQUEST' ? error.cause : null; // Only forward zod errors from input validation (others should be internal issues)
    let customError = error.cause instanceof CustomError ? error.cause : null;

    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: !!acceptableZodError ? acceptableZodError.issues : null,
        customError: !!customError ? customError.json() : null,
        // If none, we override the entire information to hide any sensitive technical information
        ...(!acceptableZodError && !customError
          ? {
              message: internalServerErrorError.message,
              customError: internalServerErrorError.json(),
            }
          : {}),
      },
    };
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
