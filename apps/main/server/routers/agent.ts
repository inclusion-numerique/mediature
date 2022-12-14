import { v4 as uuidv4 } from 'uuid';

import { AddAgentSchema, GetAgentSchema, InviteAgentSchema, ListAgentsSchema, RemoveAgentSchema } from '@mediature/main/models/actions/agent';
import { InvitationStatusSchema } from '@mediature/main/models/entities/invitation';
import { prisma } from '@mediature/main/prisma/client';
import { isUserAnAgentPartOfAuthorities, isUserAnAgentPartOfAuthority } from '@mediature/main/server/routers/case';
import { privateProcedure, router } from '@mediature/main/server/trpc';

export async function isUserMainAgentOfAuthorities(authorityIds: string[], userId: string): Promise<boolean> {
  // Remove duplicates
  authorityIds = authorityIds.filter((x, i, a) => a.indexOf(x) == i);

  const authoritiesCount = await prisma.authority.count({
    where: {
      id: {
        in: authorityIds,
      },
      mainAgent: {
        user: {
          id: userId,
        },
      },
    },
  });

  return authorityIds.length === authoritiesCount;
}

export async function isUserMainAgentOfAuthority(authorityId: string, userId: string): Promise<boolean> {
  return await isUserMainAgentOfAuthorities([authorityId], userId);
}

export const agentRouter = router({
  addAgent: privateProcedure.input(AddAgentSchema).mutation(async ({ ctx, input }) => {
    if (!(await isUserMainAgentOfAuthority(input.authorityId, ctx.user.id))) {
      throw new Error(`vous devez être agent principal de la collectivité pour effectuer cette action`);
    }

    const existingAgent = await prisma.agent.findFirst({
      where: {
        userId: input.userId,
        authorityId: input.authorityId,
      },
    });

    if (existingAgent) {
      throw new Error(`cet agent fait déjà partie de la collectivité`);
    }

    const agent = await prisma.agent.create({
      data: {
        user: {
          connect: {
            id: input.userId,
          },
        },
        authority: {
          connect: {
            id: input.authorityId,
          },
        },
      },
    });

    return { agent };
  }),
  removeAgent: privateProcedure.input(RemoveAgentSchema).mutation(async ({ ctx, input }) => {
    if (!(await isUserMainAgentOfAuthority(input.authorityId, ctx.user.id))) {
      throw new Error(`vous devez être agent principal de la collectivité pour effectuer cette action`);
    }

    // We unassign the agent from all cases where he was
    await prisma.agent.update({
      where: {
        id: input.agentId,
      },
      data: {
        Case: {
          set: [],
        },
      },
    });

    await prisma.agent.delete({
      where: {
        id: input.agentId,
      },
    });

    return;
  }),
  getAgent: privateProcedure.input(GetAgentSchema).mutation(async ({ ctx, input }) => {
    const agent = await prisma.agent.findUnique({
      where: {
        id: input.id,
      },
      include: {
        user: true,
      },
    });

    if (!agent) {
      throw new Error(`cet agent n'existe pas`);
    }

    // Before returning, make sure the caller has rights on this authority ;)
    if (!(await isUserAnAgentPartOfAuthority(agent.authorityId, ctx.user.id))) {
      throw new Error(`vous n'avez pas les droits pour effectuer une action sur cette collectivité`);
    }

    return;
  }),
  listAgents: privateProcedure.input(ListAgentsSchema).mutation(async ({ ctx, input }) => {
    const authorityIds = input.filterBy.authorityIds;

    if (!(await isUserAnAgentPartOfAuthorities(authorityIds, ctx.user.id))) {
      throw new Error(`vous n'avez pas les droits pour effectuer une recherche sur toutes les collectivités précisées`);
    }

    const agents = await prisma.agent.findMany({
      where: {
        authorityId: {
          in: authorityIds,
        },
      },
      include: {
        user: true,
      },
    });

    return { agents };
  }),
  inviteAgent: privateProcedure.input(InviteAgentSchema).mutation(async ({ ctx, input }) => {
    if (!(await isUserMainAgentOfAuthority(input.authorityId, ctx.user.id))) {
      throw new Error(`vous devez être agent principal de la collectivité pour effectuer cette action`);
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        email: input.inviteeEmail,
      },
    });

    if (existingUser) {
      throw new Error(
        `cet utilisateur existe déjà, vous pouvez le nommer agent de cette collectivité directement depuis la section d'ajout d'un agent`
      );
    }

    const existingAgentInvitation = await prisma.agentInvitation.findFirst({
      where: {
        invitation: {
          inviteeEmail: input.inviteeEmail,
          status: InvitationStatusSchema.Values.PENDING,
        },
      },
    });

    if (existingAgentInvitation) {
      throw new Error(`une invitation pour devenir agent de cette collectivité a déjà été envoyée à cette personne`);
    }

    await prisma.invitation.create({
      data: {
        issuer: {
          connect: {
            id: ctx.user.id,
          },
        },
        inviteeEmail: input.inviteeEmail,
        inviteeFirstname: input.inviteeFirstname,
        inviteeLastname: input.inviteeLastname,
        token: uuidv4(),
        status: InvitationStatusSchema.Values.PENDING,
        AgentInvitation: {
          create: {
            authorityId: input.authorityId,
          },
        },
      },
    });

    // TODO: send invitation email

    return;
  }),
});
