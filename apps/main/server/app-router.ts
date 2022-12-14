import { adminRouter } from '@mediature/main/server/routers/admin';
import { agentRouter } from '@mediature/main/server/routers/agent';
import { authRouter } from '@mediature/main/server/routers/auth';
import { caseRouter } from '@mediature/main/server/routers/case';
import { systemRouter } from '@mediature/main/server/routers/system';
import { userRouter } from '@mediature/main/server/routers/user';
import { mergeRouters } from '@mediature/main/server/trpc';

export const appRouter = mergeRouters(adminRouter, agentRouter, authRouter, caseRouter, systemRouter, userRouter);
export type AppRouter = typeof appRouter;
