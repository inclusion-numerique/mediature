import dotenv from 'dotenv';
import path from 'path';

import { prisma } from '@mediature/main/prisma';
import { seedDatabase } from '@mediature/main/prisma/seed';

// This script always targets the local test database
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

seedDatabase(prisma)
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
