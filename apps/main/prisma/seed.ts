import { PrismaClient } from '@prisma/client';

import { AuthorityTypeSchema } from '@mediature/main/models/entities/authority';

export async function truncateDatabase(prismaClient: PrismaClient) {
  const tablenames = await prismaClient.$queryRaw<Array<{ tablename: string }>>`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations')
    .map((name) => `"public"."${name}"`)
    .join(', ');

  try {
    await prismaClient.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
  } catch (error) {
    console.log({ error });
  }
}

export async function seedDatabase(prismaClient: PrismaClient) {
  // Empty all tables to avoid managing upserts+conditions+fixedUuids
  await truncateDatabase(prismaClient);

  const testUserId = '5c03994c-fc16-47e0-bd02-d218a370a078';

  // Create main user
  const mainUser = await prismaClient.user.upsert({
    where: {
      id: testUserId,
    },
    create: {
      id: testUserId,
      firstname: 'John',
      lastname: 'Doe',
      email: 'john@doe.com',
      passwordHash: '$2a$11$L2SjShQuoJoYqMPmoINuWeRLRWnzNuQf22.VgculPIlpnS8bleLEG', // Value: "test"
      status: 'CONFIRMED',
      profilePicture: null,
      Admin: {
        create: {
          canEverything: true,
        },
      },
    },
    update: {},
  });

  // Create 2 authorities
  const parisAuthority = await prismaClient.authority.create({
    data: {
      name: 'Mairie de Paris',
      slug: 'maire-de-paris',
      type: AuthorityTypeSchema.Values.CITY,
    },
  });

  const bretagneAuthority = await prismaClient.authority.create({
    data: {
      name: 'Région Bretagne',
      slug: 'bretagne',
      type: AuthorityTypeSchema.Values.CITY,
    },
  });

  // Add the main user as an agent in an authority
  const bretagneAgent = await prismaClient.agent.create({
    data: {
      user: {
        connect: {
          id: mainUser.id,
        },
      },
      authority: {
        connect: {
          id: bretagneAuthority.id,
        },
      },
    },
  });

  // Set the main user as "main" in an authority
  await prismaClient.authority.update({
    where: {
      id: bretagneAuthority.id,
    },
    data: {
      mainAgent: {
        connect: {
          id: bretagneAgent.id,
        },
      },
    },
  });
}
