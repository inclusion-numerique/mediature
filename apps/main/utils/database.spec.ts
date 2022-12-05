import { PrismaClient } from '@prisma/client';
import concurrently from 'concurrently';

import { seedDatabase } from '@mediature/main/prisma/seed';
import { PostgresContainer, setupProgres } from '@mediature/main/utils/database';

describe('database', () => {
  let postgres: PostgresContainer | undefined;
  let prisma: PrismaClient | undefined;

  beforeAll(async () => {
    postgres = await setupProgres();

    process.env.DATABASE_URL = postgres.url;
    prisma = new PrismaClient();
  }, 30 * 1000);

  afterAll(async () => {
    if (prisma) {
      await prisma.$disconnect();
    }

    if (postgres) {
      await postgres.container.stop();
    }
  });

  describe('testcontainers', () => {
    it('should be working', () => {
      jest.setTimeout(5 * 1000);
    });
  });

  describe('prisma', () => {
    it('migrate', async () => {
      const { result } = concurrently(['npm:db:push']);

      await result;
    });
  });

  describe('prisma', () => {
    it('seed', async () => {
      await seedDatabase(prisma);

      const usersCount = await prisma.user.count();

      expect(usersCount).toBe(1);
    });
  });
});
