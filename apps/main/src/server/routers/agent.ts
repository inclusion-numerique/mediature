import { v4 as uuidv4 } from 'uuid';

import { prisma } from '@mediature/main/prisma/client';
import { mailer } from '@mediature/main/src/emails/mailer';
import {
  AddAgentSchema,
  GetAgentSchema,
  InviteAgentSchema,
  ListAgentInvitationsSchema,
  ListAgentsSchema,
  RemoveAgentSchema,
} from '@mediature/main/src/models/actions/agent';
import { InvitationSchemaType, InvitationStatusSchema } from '@mediature/main/src/models/entities/invitation';
import { isUserAnAgentPartOfAuthorities, isUserAnAgentPartOfAuthority } from '@mediature/main/src/server/routers/case';
import { agentPrismaToModel } from '@mediature/main/src/server/routers/mappers';
import { privateProcedure, router } from '@mediature/main/src/server/trpc';
import { linkRegistry } from '@mediature/main/src/utils/routes/registry';

import { AgentWrapperSchemaType } from '../../models/entities/agent';

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

    const originatorUser = await prisma.user.findUniqueOrThrow({
      where: {
        id: ctx.user.id,
      },
    });

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
  }),
  removeAgent: privateProcedure.input(RemoveAgentSchema).mutation(async ({ ctx, input }) => {
    if (!(await isUserMainAgentOfAuthority(input.authorityId, ctx.user.id))) {
      throw new Error(`vous devez être agent principal de la collectivité pour effectuer cette action`);
    }

    // We unassign the agent from all cases where he was
    const agent = await prisma.agent.update({
      where: {
        id: input.agentId,
      },
      data: {
        CaseAssigned: {
          set: [],
        },
      },
      include: { user: true },
    });

    const authority = await prisma.authority.findUniqueOrThrow({
      where: {
        id: input.authorityId,
      },
    });

    await prisma.agent.delete({
      where: {
        id: input.agentId,
      },
    });

    await mailer.sendAuthorityAgentRemoved({
      recipient: agent.user.email,
      firstname: agent.user.firstname,
      authorityName: authority.name,
    });
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
  listAgents: privateProcedure.input(ListAgentsSchema).query(async ({ ctx, input }) => {
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
        CaseAssigned: true,
        user: true,
      },
    });

    return {
      agentsWrappers: agents.map((agent): AgentWrapperSchemaType => {
        let openCases: number = 0;
        let closeCases: number = 0;
        for (const agentCase of agent.CaseAssigned) {
          if (agentCase.closedAt) {
            closeCases++;
          } else {
            openCases++;
          }
        }

        return {
          agent: agentPrismaToModel(agent),
          openCases: openCases,
          closeCases: closeCases,
        };
      }),
    };
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

    const originatorUser = await prisma.user.findUniqueOrThrow({
      where: {
        id: ctx.user.id,
      },
    });

    const authority = await prisma.authority.findUniqueOrThrow({
      where: {
        id: input.authorityId,
      },
    });

    const invitation = await prisma.invitation.create({
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

    await mailer.sendSignUpInvitationAsAgent({
      recipient: invitation.inviteeEmail,
      firstname: invitation.inviteeFirstname || undefined,
      lastname: invitation.inviteeLastname || undefined,
      originatorFirstname: originatorUser.firstname,
      originatorLastname: originatorUser.lastname,
      authorityName: authority.name,
      signUpUrlWithToken: linkRegistry.get('signUp', { token: invitation.token }, { absolute: true }),
    });
  }),
  listAgentInvitations: privateProcedure.input(ListAgentInvitationsSchema).query(async ({ ctx, input }) => {
    const authorityIds = input.filterBy.authorityIds;

    if (!(await isUserAnAgentPartOfAuthorities(authorityIds, ctx.user.id))) {
      throw new Error(`vous n'avez pas les droits pour effectuer une recherche sur toutes les collectivités précisées`);
    }

    const agentInvitations = await prisma.agentInvitation.findMany({
      where: {
        authorityId: {
          in: authorityIds,
        },
        invitation: {
          status: input.filterBy.status || undefined,
        },
      },
      include: {
        invitation: {
          include: {
            issuer: true,
          },
        },
      },
    });

    return {
      invitations: agentInvitations.map((agentInvitation): InvitationSchemaType => {
        return {
          id: agentInvitation.invitation.id,
          inviteeEmail: agentInvitation.invitation.inviteeEmail,
          inviteeFirstname: agentInvitation.invitation.inviteeFirstname,
          inviteeLastname: agentInvitation.invitation.inviteeLastname,
          issuer: {
            id: agentInvitation.invitation.issuer.id,
            email: agentInvitation.invitation.issuer.email,
            firstname: agentInvitation.invitation.issuer.firstname,
            lastname: agentInvitation.invitation.issuer.lastname,
          },
          status: agentInvitation.invitation.status,
          createdAt: agentInvitation.invitation.createdAt,
          updatedAt: agentInvitation.invitation.updatedAt,
          deletedAt: agentInvitation.invitation.deletedAt,
        };
      }),
    };
  }),
});
