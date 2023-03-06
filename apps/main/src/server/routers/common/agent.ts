import { prisma } from '@mediature/main/prisma/client';
import { mailer } from '@mediature/main/src/emails/mailer';
import { linkRegistry } from '@mediature/main/src/utils/routes/registry';

export interface AddAgentOptions {
  userId: string;
  authorityId: string;
  originatorUserId: string;
  grantMainAgent: boolean;
}

export async function addAgent(options: AddAgentOptions) {
  const existingAgent = await prisma.agent.findFirst({
    where: {
      userId: options.userId,
      authorityId: options.authorityId,
    },
  });

  if (existingAgent) {
    throw new Error(`ce médiateur fait déjà partie de la collectivité`);
  }

  const originatorUser = await prisma.user.findUniqueOrThrow({
    where: {
      id: options.originatorUserId,
    },
  });

  const agent = await prisma.agent.create({
    data: {
      user: {
        connect: {
          id: options.userId,
        },
      },
      authority: {
        connect: {
          id: options.authorityId,
        },
      },
      AuthorityWhereMainAgent: options.grantMainAgent
        ? {
            connect: {
              id: options.authorityId,
            },
          }
        : undefined,
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
