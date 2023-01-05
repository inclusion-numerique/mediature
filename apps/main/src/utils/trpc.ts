import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

import type { AppRouter } from '@mediature/main/src/server/app-router';

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
