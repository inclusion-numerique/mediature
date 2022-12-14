import { publicProcedure, router } from '@mediature/main/server/trpc';

export const systemRouter = router({
  healthcheck: publicProcedure.query(() => 'OK'),
});
