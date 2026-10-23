import { PrismaPg } from '@prisma/adapter-pg';

import { dbPool } from '@mediature/main/prisma/pool';
import { PrismaClient } from '@mediature/main/src/generated/prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

const adapter = new PrismaPg(dbPool);

export const prisma =
  global.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.APP_MODE === 'prod' ? ['error'] : ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
