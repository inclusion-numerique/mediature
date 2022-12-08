import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

import type { AppRouter } from '@mediature/main/server/app-router';

export type Inputs = inferRouterInputs<AppRouter>;
export type Outputs = inferRouterOutputs<AppRouter>;
