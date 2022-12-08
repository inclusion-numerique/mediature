import { publicProcedure, router } from '@mediature/main/server/trpc';

export const appRouter = router({
  healthcheck: publicProcedure.query(() => 'OK'),
  greeting: publicProcedure.query((req) => {
    return {
      text: `Hello` as const,
    };
  }),
});

export type AppRouter = typeof appRouter;
