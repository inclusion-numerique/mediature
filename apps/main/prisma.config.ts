import path from 'node:path';
import type { PrismaConfig } from 'prisma';

// Some commands like `prisma generate` do not need a database, so we provide a placeholder to not require the environment variable
const placeholderUrl = 'postgresql://placeholder:placeholder@localhost:5432/placeholder';

// [IMPORTANT] We do not use `defineConfig()` from `prisma/config` since on Scalingo the `postdeploy` migration runs with `npx prisma@x.y.z`
// after `node_modules` have been removed (`.slugignore`), so the import could not be resolved (a type import is removed at runtime)
export default {
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    url: process.env.DATABASE_URL ?? placeholderUrl,
  },
  migrations: {
    path: path.join('prisma', 'migrations'),
    seed: 'tsx --tsconfig ../../packages/tsconfig/tsx-fallback.json prisma/seed.script.ts',
  },
} satisfies PrismaConfig;
