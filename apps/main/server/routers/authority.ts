import {
  CreateAuthoritySchema,
  DeleteAuthoritySchema,
  GetAuthoritySchema,
  ListAuthoritiesSchema,
  UpdateAuthoritySchema,
} from '@mediature/main/models/actions/authority';
import { prisma } from '@mediature/main/prisma/client';
import { privateProcedure, router } from '@mediature/main/server/trpc';

export async function isUserAnAdmin(userId: string): Promise<boolean> {
  const admin = await prisma.admin.findFirst({
    where: {
      user: {
        id: userId,
      },
    },
  });

  return !!admin;
}

export async function requiresThereIsNoSimilarAuthority(authorityName: string, authoritySlug: string, excludeAuthorityId?: string): Promise<void> {
  const existingAuthority = await prisma.authority.findFirst({
    where: {
      name: authorityName,
      OR: {
        slug: authoritySlug,
      },
    },
  });

  if (existingAuthority && existingAuthority.id !== excludeAuthorityId) {
    if (existingAuthority.name === authorityName) {
      throw new Error(`une collectivité existe déjà avec ce nom`);
    } else {
      throw new Error(`une collectivité existe déjà avec cet identifiant technique (slug)`);
    }
  }
}

export const authorityRouter = router({
  createAuthority: privateProcedure.input(CreateAuthoritySchema).mutation(async ({ ctx, input }) => {
    if (!(await isUserAnAdmin(ctx.user.id))) {
      throw new Error(`vous devez être un administrateur pour effectuer cette action`);
    }

    await requiresThereIsNoSimilarAuthority(input.name, input.slug);

    const newAuthority = await prisma.authority.create({
      data: {
        name: input.name,
        slug: input.slug,
        type: input.type,
        logo: input.logoAttachmentId
          ? {
              connect: {
                id: input.logoAttachmentId,
              },
            }
          : undefined,
      },
    });

    return newAuthority;
  }),
  updateAuthority: privateProcedure.input(UpdateAuthoritySchema).mutation(async ({ ctx, input }) => {
    if (!(await isUserAnAdmin(ctx.user.id))) {
      throw new Error(`vous devez être un administrateur pour effectuer cette action`);
    }

    await requiresThereIsNoSimilarAuthority(input.name, input.slug, input.authorityId);

    const authority = prisma.authority.update({
      where: {
        id: input.authorityId,
      },
      data: {
        name: input.name,
        slug: input.slug,
        type: input.type,
        logo: {
          connect: input.logoAttachmentId
            ? {
                id: input.logoAttachmentId,
              }
            : undefined,
          disconnect: !input.logoAttachmentId ? true : undefined,
        },
      },
    });

    return authority;
  }),
  deleteAuthority: privateProcedure.input(DeleteAuthoritySchema).mutation(async ({ ctx, input }) => {
    if (!(await isUserAnAdmin(ctx.user.id))) {
      throw new Error(`vous devez être un administrateur pour effectuer cette action`);
    }

    // To avoid mistake we require there is no agent inside the authority
    const authorityAgentsCount = await prisma.agent.count({
      where: {
        authority: {
          is: {
            id: input.authorityId,
          },
        },
      },
    });

    if (authorityAgentsCount > 0) {
      throw new Error(`vous ne pouvez pas supprimer une collectivité qui contient des agents`);
    }

    await prisma.authority.delete({
      where: {
        id: input.authorityId,
      },
    });

    return;
  }),
  getAuthority: privateProcedure.input(GetAuthoritySchema).query(async ({ ctx, input }) => {
    if (!(await isUserAnAdmin(ctx.user.id))) {
      throw new Error(`vous devez être un administrateur pour effectuer cette action`);
    }

    const authority = await prisma.authority.findUnique({
      where: {
        id: input.id,
      },
    });

    if (!authority) {
      throw new Error(`aucune collectivité trouvée`);
    }

    return authority;
  }),
  listAuthorities: privateProcedure.input(ListAuthoritiesSchema).query(async ({ ctx, input }) => {
    if (!(await isUserAnAdmin(ctx.user.id))) {
      throw new Error(`vous devez être un administrateur pour effectuer cette action`);
    }

    const cases = await prisma.case.findMany({
      where: {
        // TODO: pagination
      },
    });

    return { cases };
  }),
});
