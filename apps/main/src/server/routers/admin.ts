import { v4 as uuidv4 } from 'uuid';

import { prisma } from '@mediature/main/prisma/client';
import { mailer } from '@mediature/main/src/emails/mailer';
import {
  DeleteUserSchema,
  GrantAdminSchema,
  InviteAdminSchema,
  ListUsersAndRolesSchema,
  RevokeAdminSchema,
} from '@mediature/main/src/models/actions/admin';
import { InvitationStatusSchema } from '@mediature/main/src/models/entities/invitation';
import { isUserAnAdmin } from '@mediature/main/src/server/routers/authority';
import { privateProcedure, router } from '@mediature/main/src/server/trpc';
import { linkRegistry } from '@mediature/main/src/utils/routes/registry';

export const adminRouter = router({
  grantAdmin: privateProcedure.input(GrantAdminSchema).mutation(async ({ ctx, input }) => {
    if (!(await isUserAnAdmin(ctx.user.id))) {
      throw new Error(`vous devez être un administrateur pour effectuer cette action`);
    }

    const existingAdmin = await prisma.admin.findFirst({
      where: {
        user: {
          id: input.userId,
        },
      },
    });

    if (existingAdmin) {
      return;
    }

    const originatorUser = await prisma.user.findUniqueOrThrow({
      where: {
        id: ctx.user.id,
      },
    });

    const grantedUser = await prisma.user.update({
      where: {
        id: input.userId,
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
        id: ctx.user.id,
      },
    });

    if (!revokedUser) {
      throw new Error(`l'utilisateur que vous avez renseigné n'existe pas`);
    }

    await prisma.admin.deleteMany({
      where: {
        user: {
          id: input.userId,
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
      throw new Error(`cet utilisateur existe déjà, vous pouvez le nommer administrateur directement depuis la liste des utilisateurs`);
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
        Admin: input.filterBy.isAdmin
          ? {
              some: {},
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
