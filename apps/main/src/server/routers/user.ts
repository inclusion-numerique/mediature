import { prisma } from '@mediature/main/prisma/client';
import {
  GetInterfaceSessionSchema,
  GetProfileSchema,
  GetPublicFacingInvitationSchema,
  UpdateProfileSchema,
} from '@mediature/main/src/models/actions/user';
import { InvitationStatusSchema, PublicFacingInvitationSchema } from '@mediature/main/src/models/entities/invitation';
import { UserInterfaceSessionSchema } from '@mediature/main/src/models/entities/ui';
import { privateProcedure, publicProcedure, router } from '@mediature/main/src/server/trpc';

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
      throw new Error(`le jeton d'invitation fournit n'est pas valide`);
    } else if (invitation.status !== InvitationStatusSchema.Values.PENDING) {
      throw new Error(`le jeton d'invitation n'est plus utilisable`);
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
    return { user };
  }),
  getProfile: privateProcedure.input(GetProfileSchema).query(async ({ ctx, input }) => {
    const user = await prisma.user.findUnique({
      where: {
        id: ctx.user.id,
      },
    });

    // TODO: exclude hashed password
    return { user };
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
        }),
      };
    }

    return {
      session: UserInterfaceSessionSchema.parse({
        agentOf: user.Agent.map((agent) => {
          return {
            id: agent.authority.id,
            // logo: agent.authority.logo,
            logo: null,
            name: agent.authority.name,
            slug: agent.authority.slug,
            isMainAgent: agent.id === agent.authority.mainAgentId,
          };
        }),
        isAdmin: !!user.Admin,
      }),
    };
  }),
});
