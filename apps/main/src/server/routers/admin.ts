import { v4 as uuidv4 } from 'uuid';

import { prisma } from '@mediature/main/prisma/client';
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

    if (!existingAdmin) {
      await prisma.user.update({
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

      return;
    }
  }),
  revokeAdmin: privateProcedure.input(RevokeAdminSchema).mutation(async ({ ctx, input }) => {
    if (!(await isUserAnAdmin(ctx.user.id))) {
      throw new Error(`vous devez être un administrateur pour effectuer cette action`);
    }

    await prisma.admin.deleteMany({
      where: {
        user: {
          id: input.userId,
        },
      },
    });

    return;
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
        AdminInvitation: {
          create: {
            canEverything: true,
          },
        },
      },
    });

    // TODO: send invitation email

    return;
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

    await prisma.user.delete({
      where: {
        id: input.userId,
      },
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
