// Note: the Prisma schema must be compiled when importing, that's why we added the `test:prepare` and `lint:prepare` steps
import { PrismaClient } from '@prisma/client';
import concurrently from 'concurrently';

import { seedDatabase } from '@mediature/main/prisma/seed';
import { PostgresContainer, setupProgres } from '@mediature/main/src/utils/database';

describe('database', () => {
  let postgres: PostgresContainer;
  let prisma: PrismaClient;

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
    it('check schema', async () => {
      const { result } = concurrently(['npm:db:schema:check:unsecure']);

      await result;
    });

    it(
      'migrate',
      async () => {
        const { result } = concurrently(['npm:db:push:unsecure']);

        await result;
      },
      15 * 1000
    );

    it('seed', async () => {
      await seedDatabase(prisma);

      const usersCount = await prisma.user.count();

      expect(usersCount).toBe(1);
    });
  });
});
