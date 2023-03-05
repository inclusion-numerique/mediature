import { prisma } from '@mediature/main/prisma/client';
import { mailer } from '@mediature/main/src/emails/mailer';
import { linkRegistry } from '@mediature/main/src/utils/routes/registry';

export async function grantAdmin(userId: string, originatorUserId: string): Promise<void> {
  const existingAdmin = await prisma.admin.findFirst({
    where: {
      user: {
        id: userId,
      },
    },
  });

  if (existingAdmin) {
    return;
  }

  const originatorUser = await prisma.user.findUniqueOrThrow({
    where: {
      id: originatorUserId,
    },
  });

  const grantedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      Admin: {
        create: {
          canEverything: true,
        },
      },
    },
  });

  await mailer.sendAdminRoleGranted({
    recipient: grantedUser.email,
    firstname: grantedUser.firstname,
    originatorFirstname: originatorUser.firstname,
    originatorLastname: originatorUser.lastname,
    adminDashboardUrl: linkRegistry.get('dashboard', undefined, { absolute: true }),
  });
}
