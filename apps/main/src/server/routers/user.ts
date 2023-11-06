import { LiveChatSettings } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

import { prisma } from '@mediature/main/prisma/client';
import {
  CancelInvitationSchema,
  GetInterfaceSessionSchema,
  GetLiveChatSettingsSchema,
  GetProfileSchema,
  GetPublicFacingInvitationSchema,
  UpdateProfileSchema,
} from '@mediature/main/src/models/actions/user';
import {
  adminOrAuthorityMainAgentRoleRequiredError,
  adminRoleRequiredError,
  invalidInvitationError,
  invitationCannotBeCanceledError,
  invitationNoLongerUsableError,
  invitationNotFoundError,
  userNotFoundError,
} from '@mediature/main/src/models/entities/errors';
import { InvitationStatusSchema, PublicFacingInvitationSchema } from '@mediature/main/src/models/entities/invitation';
import { UserInterfaceSessionSchema } from '@mediature/main/src/models/entities/ui';
import { LiveChatSettingsSchema, LiveChatSettingsSchemaType } from '@mediature/main/src/models/entities/user';
import { isUserAnAdmin } from '@mediature/main/src/server/routers/authority';
import { isUserMainAgentOfAuthority } from '@mediature/main/src/server/routers/common/agent';
import { attachmentIdPrismaToModel, userPrismaToModel } from '@mediature/main/src/server/routers/mappers';
import { privateProcedure, publicProcedure, router } from '@mediature/main/src/server/trpc';
import { signEmail } from '@mediature/main/src/utils/crisp';

export const userRouter = router({
  getPublicFacingInvitation: publicProcedure.input(GetPublicFacingInvitationSchema).query(async ({ ctx, input }) => {
    const invitation = await prisma.invitation.findFirst({
      where: {
        token: input.token,
      },
      include: {
        issuer: true,
      },
    });

    if (!invitation) {
      throw invalidInvitationError;
    } else if (invitation.status !== InvitationStatusSchema.Values.PENDING) {
      throw invitationNoLongerUsableError;
    }

    return {
      invitation: PublicFacingInvitationSchema.parse({
        inviteeEmail: invitation.inviteeEmail,
        inviteeFirstname: invitation.inviteeFirstname,
        inviteeLastname: invitation.inviteeLastname,
        issuer: {
          id: invitation.issuer.id,
          email: invitation.issuer.email,
          firstname: invitation.issuer.firstname,
          lastname: invitation.issuer.lastname,
        },
        status: invitation.status,
      }),
    };
  }),
  updateProfile: privateProcedure.input(UpdateProfileSchema).mutation(async ({ ctx, input }) => {
    const user = await prisma.user.update({
      where: {
        id: ctx.user.id,
      },
      data: {
        firstname: input.firstname,
        lastname: input.lastname,
        profilePicture: input.profilePicture,
      },
    });

    // TODO: exclude hashed password
    return { user: userPrismaToModel(user) };
  }),
  getProfile: privateProcedure.input(GetProfileSchema).query(async ({ ctx, input }) => {
    const user = await prisma.user.findUnique({
      where: {
        id: ctx.user.id,
      },
    });

    if (!user) {
      throw userNotFoundError;
    }

    // TODO: exclude hashed password
    return { user: userPrismaToModel(user) };
  }),
  getInterfaceSession: privateProcedure.input(GetInterfaceSessionSchema).query(async ({ ctx, input }) => {
    const user = await prisma.user.findUnique({
      where: {
        id: ctx.user.id,
      },
      include: {
        Admin: true,
        Agent: {
          include: {
            authority: true,
          },
        },
      },
    });

    if (!user) {
      return {
        session: UserInterfaceSessionSchema.parse({
          agentOf: [],
          isAdmin: false,
          assignedUnprocessedMessages: 0,
        }),
      };
    }

    const unprocessedMessagesCountObjects = await prisma.$queryRaw<
      {
        authorityId: string;
        count: BigInt;
      }[]
    >`SELECT a."authorityId", COUNT(*) AS count FROM "MessagesOnCases" moc INNER JOIN "Case" c ON c.id = moc."caseId" INNER JOIN "Agent" a ON a.id = c."agentId" INNER JOIN "User" u ON u.id = a."userId" WHERE (moc."markedAsProcessed" = false AND u.id = ${user.id}::uuid) GROUP BY a."authorityId"`;

    return {
      session: UserInterfaceSessionSchema.parse({
        agentOf: await Promise.all(
          user.Agent.map(async (agent) => {
            const unprocessedMessagesCountObject = unprocessedMessagesCountObjects.find(
              (countObject) => countObject.authorityId === agent.authorityId
            );

            return {
              id: agent.authority.id,
              logo: await attachmentIdPrismaToModel(agent.authority.logoAttachmentId),
              name: agent.authority.name,
              slug: agent.authority.slug,
              agentId: agent.id,
              isMainAgent: agent.id === agent.authority.mainAgentId,
              assignedUnprocessedMessages: unprocessedMessagesCountObject ? Number(unprocessedMessagesCountObject.count) : 0,
            };
          })
        ),
        isAdmin: !!user.Admin,
      }),
    };
  }),
  getLiveChatSettings: privateProcedure.input(GetLiveChatSettingsSchema).query(async ({ ctx, input }) => {
    const user = await prisma.user.findUnique({
      where: {
        id: ctx.user.id,
      },
      include: {
        LiveChatSettings: true,
      },
    });

    let settings: LiveChatSettings;
    if (!user) {
      throw userNotFoundError;
    } else if (!user.LiveChatSettings) {
      // It has never been initialized, so we do it
      settings = await prisma.liveChatSettings.create({
        data: {
          sessionToken: uuidv4(),
          user: {
            connect: {
              id: user.id,
            },
          },
        },
      });
    } else {
      settings = user.LiveChatSettings;
    }

    return {
      settings: LiveChatSettingsSchema.parse({
        userId: user.id,
        email: user.email,
        emailSignature: signEmail(user.email),
        firstname: user.firstname,
        lastname: user.lastname,
        sessionToken: settings.sessionToken,
      }),
    };
  }),
  cancelInvitation: privateProcedure.input(CancelInvitationSchema).mutation(async ({ ctx, input }) => {
    const invitation = await prisma.invitation.findUnique({
      where: {
        id: input.invitationId,
      },
      include: {
        AgentInvitation: true,
        AdminInvitation: true,
      },
    });

    if (!invitation) {
      throw invitationNotFoundError;
    }

    if (invitation.status !== InvitationStatusSchema.Values.PENDING) {
      throw invitationCannotBeCanceledError;
    }

    if (invitation.AgentInvitation) {
      if (!(await isUserAnAdmin(ctx.user.id)) && !(await isUserMainAgentOfAuthority(invitation.AgentInvitation.authorityId, ctx.user.id))) {
        throw adminOrAuthorityMainAgentRoleRequiredError;
      }
    } else {
      if (!(await isUserAnAdmin(ctx.user.id))) {
        throw adminRoleRequiredError;
      }
    }

    const canceledInvitation = await prisma.invitation.update({
      where: {
        id: invitation.id,
      },
      data: {
        status: InvitationStatusSchema.Values.CANCELED,
      },
    });
  }),
});
