import { v4 as uuidv4 } from 'uuid';

import { prisma } from '@mediature/main/prisma/client';
import { mailer } from '@mediature/main/src/emails/mailer';
import {
  DeleteUserSchema,
  GrantAdminSchema,
  InviteAdminSchema,
  ListAdminInvitationsSchema,
  ListAdminsSchema,
  ListUsersAndRolesSchema,
  RevokeAdminSchema,
} from '@mediature/main/src/models/actions/admin';
import { AdminSchemaType } from '@mediature/main/src/models/entities/admin';
import { InvitationSchemaType, InvitationStatusSchema } from '@mediature/main/src/models/entities/invitation';
import { isUserAnAdmin } from '@mediature/main/src/server/routers/authority';
import { grantAdmin } from '@mediature/main/src/server/routers/common/admin';
import { adminPrismaToModel } from '@mediature/main/src/server/routers/mappers';
import { privateProcedure, router } from '@mediature/main/src/server/trpc';
import { linkRegistry } from '@mediature/main/src/utils/routes/registry';

export const adminRouter = router({
  grantAdmin: privateProcedure.input(GrantAdminSchema).mutation(async ({ ctx, input }) => {
    if (!(await isUserAnAdmin(ctx.user.id))) {
      throw new Error(`vous devez être un administrateur pour effectuer cette action`);
    }

    return await grantAdmin(input.userId, ctx.user.id);
  }),
  revokeAdmin: privateProcedure.input(RevokeAdminSchema).mutation(async ({ ctx, input }) => {
    if (!(await isUserAnAdmin(ctx.user.id))) {
      throw new Error(`vous devez être un administrateur pour effectuer cette action`);
    }

    const originatorUser = await prisma.user.findUniqueOrThrow({
      where: {
        id: ctx.user.id,
      },
    });

    const revokedUser = await prisma.user.findUnique({
      where: {
        id: input.userId,
      },
    });

    if (!revokedUser) {
      throw new Error(`l'utilisateur que vous avez renseigné n'existe pas`);
    } else if (revokedUser.id === originatorUser.id) {
      throw new Error(`vous ne pouvez pas vous enlever vous-même vos droits d'administrateur`);
    }

    await prisma.admin.deleteMany({
      where: {
        user: {
          id: revokedUser.id,
        },
      },
    });

    await mailer.sendAdminRoleRevoked({
      recipient: revokedUser.email,
      firstname: revokedUser.firstname,
      originatorFirstname: originatorUser.firstname,
      originatorLastname: originatorUser.lastname,
    });
  }),
  listAdmins: privateProcedure.input(ListAdminsSchema).query(async ({ ctx, input }) => {
    if (!(await isUserAnAdmin(ctx.user.id))) {
      throw new Error(`vous devez être un administrateur pour effectuer cette action`);
    }

    const admins = await prisma.admin.findMany({
      include: {
        user: true,
      },
    });

    return {
      admins: admins.map((admin): AdminSchemaType => {
        return adminPrismaToModel(admin);
      }),
    };
  }),
  inviteAdmin: privateProcedure.input(InviteAdminSchema).mutation(async ({ ctx, input }) => {
    if (!(await isUserAnAdmin(ctx.user.id))) {
      throw new Error(`vous devez être un administrateur pour effectuer cette action`);
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        email: input.inviteeEmail,
      },
    });

    if (existingUser) {
      // Try to grant the user directly
      return await grantAdmin(existingUser.id, ctx.user.id);
    }

    const existingAdminInvitation = await prisma.adminInvitation.findFirst({
      where: {
        invitation: {
          inviteeEmail: input.inviteeEmail,
          status: InvitationStatusSchema.Values.PENDING,
        },
      },
    });

    if (existingAdminInvitation) {
      throw new Error(`une invitation pour devenir administrateur a déjà été envoyée à cette personne`);
    }

    const originatorUser = await prisma.user.findUniqueOrThrow({
      where: {
        id: ctx.user.id,
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
        AdminInvitation: {
          create: {
            canEverything: true,
          },
        },
      },
    });

    await mailer.sendSignUpInvitationAsAdmin({
      recipient: invitation.inviteeEmail,
      firstname: invitation.inviteeFirstname || undefined,
      lastname: invitation.inviteeLastname || undefined,
      originatorFirstname: originatorUser.firstname,
      originatorLastname: originatorUser.lastname,
      signUpUrlWithToken: linkRegistry.get('signUp', { token: invitation.token }, { absolute: true }),
    });
  }),
  listAdminInvitations: privateProcedure.input(ListAdminInvitationsSchema).query(async ({ ctx, input }) => {
    if (!(await isUserAnAdmin(ctx.user.id))) {
      throw new Error(`vous devez être un administrateur pour effectuer cette action`);
    }

    const adminInvitations = await prisma.adminInvitation.findMany({
      where: {
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
      invitations: adminInvitations.map((adminInvitation): InvitationSchemaType => {
        return {
          id: adminInvitation.invitation.id,
          inviteeEmail: adminInvitation.invitation.inviteeEmail,
          inviteeFirstname: adminInvitation.invitation.inviteeFirstname,
          inviteeLastname: adminInvitation.invitation.inviteeLastname,
          issuer: {
            id: adminInvitation.invitation.issuer.id,
            email: adminInvitation.invitation.issuer.email,
            firstname: adminInvitation.invitation.issuer.firstname,
            lastname: adminInvitation.invitation.issuer.lastname,
          },
          status: adminInvitation.invitation.status,
          createdAt: adminInvitation.invitation.createdAt,
          updatedAt: adminInvitation.invitation.updatedAt,
          deletedAt: adminInvitation.invitation.deletedAt,
        };
      }),
    };
  }),
  deleteUser: privateProcedure.input(DeleteUserSchema).mutation(async ({ ctx, input }) => {
    if (!(await isUserAnAdmin(ctx.user.id))) {
      throw new Error(`vous devez être un administrateur pour effectuer cette action`);
    }

    // To avoid mistake we require the user is not an agent somewhere
    // TODO: check also the targeted user is not an admin?
    const userAgentsCount = await prisma.agent.count({
      where: {
        user: {
          id: input.userId,
        },
      },
    });

    if (userAgentsCount > 0) {
      throw new Error(`vous ne pouvez pas supprimer une collectivité qui contient des agents`);
    }

    const deletedUser = await prisma.user.delete({
      where: {
        id: input.userId,
      },
    });

    await mailer.sendUserDeleted({
      recipient: deletedUser.email,
      firstname: deletedUser.firstname,
    });

    return;
  }),
  listUsersAndRoles: privateProcedure.input(ListUsersAndRolesSchema).query(async ({ ctx, input }) => {
    if (!(await isUserAnAdmin(ctx.user.id))) {
      throw new Error(`vous devez être un administrateur pour effectuer cette action`);
    }

    const users = await prisma.user.findMany({
      where: {
        firstname: input.filterBy.query
          ? {
              search: input.filterBy.query,
              mode: 'insensitive',
            }
          : undefined,
        lastname: input.filterBy.query
          ? {
              search: input.filterBy.query,
              mode: 'insensitive',
            }
          : undefined,
        email: input.filterBy.query
          ? {
              search: input.filterBy.query,
              mode: 'insensitive',
            }
          : undefined,
        Agent:
          input.filterBy.authorityIds || input.filterBy.isAgent !== null
            ? {
                some: {
                  // "some: {}" minimal object is for the "isAgent" condition
                  authority: input.filterBy.authorityIds
                    ? {
                        is: {
                          id: {
                            in: input.filterBy.authorityIds,
                          },
                        },
                      }
                    : undefined,
                },
              }
            : undefined,
        Admin:
          input.filterBy.isAdmin !== null
            ? {
                is: input.filterBy.isAdmin === false ? null : undefined,
                isNot: input.filterBy.isAdmin === true ? null : undefined,
              }
            : undefined,
      },
      include: {
        Admin: true,
        Agent: true,
      },
    });

    // TODO: make a clear wrapper object to have things like "isAdmin" and "numberOfBoundAuthorities" properties instead of the DB model inside the templating
    // TODO: pagination
    return { users };
  }),
});
