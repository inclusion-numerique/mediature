import { PrismaClient } from '@prisma/client';

export async function seedDatabase(prismaClient: PrismaClient) {
  const testUserId = '5c03994c-fc16-47e0-bd02-d218a370a078';

  await prismaClient.user.upsert({
    where: {
      id: testUserId,
    },
    create: {
      id: testUserId,
      firstname: 'John',
      lastname: 'Doe',
      email: 'john@doe.com',
      status: 'CONFIRMED',
      profilePicture: null,
    },
    update: {},
  });
}
