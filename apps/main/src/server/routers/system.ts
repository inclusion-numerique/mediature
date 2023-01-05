import { publicProcedure, router } from '@mediature/main/src/server/trpc';

export const systemRouter = router({
  healthcheck: publicProcedure.query(() => 'OK'),
});
