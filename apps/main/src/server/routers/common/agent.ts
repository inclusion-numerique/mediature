import { prisma } from '@mediature/main/prisma/client';
import { mailer } from '@mediature/main/src/emails/mailer';
import { linkRegistry } from '@mediature/main/src/utils/routes/registry';

export async function addAgent(userId: string, authorityId: string, originatorUserId: string) {
  const existingAgent = await prisma.agent.findFirst({
    where: {
      userId: userId,
      authorityId: authorityId,
    },
  });

  if (existingAgent) {
    throw new Error(`ce médiateur fait déjà partie de la collectivité`);
  }

  const originatorUser = await prisma.user.findUniqueOrThrow({
    where: {
      id: originatorUserId,
    },
  });

  const agent = await prisma.agent.create({
    data: {
      user: {
        connect: {
          id: userId,
        },
      },
      authority: {
        connect: {
          id: authorityId,
        },
      },
    },
    include: {
      user: true,
      authority: true,
    },
  });

  await mailer.sendWelcomeAuthorityAgent({
    recipient: agent.user.email,
    firstname: agent.user.firstname,
    originatorFirstname: originatorUser.firstname,
    originatorLastname: originatorUser.lastname,
    authorityName: agent.authority.name,
    authorityDashboardUrl: linkRegistry.get('dashboard', undefined, { absolute: true }), // TODO: use below when the page exists
    // authorityDashboardUrl: linkRegistry.get('authority', { authorityId: agent.authorityId }, { absolute: true }),
  });

  return { agent };
}
