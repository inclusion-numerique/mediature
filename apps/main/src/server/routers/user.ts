import { prisma } from '@mediature/main/prisma/client';
import { GetInterfaceSessionSchema, GetProfileSchema, UpdateProfileSchema } from '@mediature/main/src/models/actions/user';
import { UserInterfaceSessionSchema } from '@mediature/main/src/models/entities/ui';
import { privateProcedure, router } from '@mediature/main/src/server/trpc';

export const userRouter = router({
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
