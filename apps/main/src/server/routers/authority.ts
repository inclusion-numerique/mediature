import { prisma } from '@mediature/main/prisma/client';
import {
  CreateAuthoritySchema,
  DeleteAuthoritySchema,
  GetAuthoritySchema,
  GetPublicFacingAuthoritySchema,
  ListAuthoritiesSchema,
  UpdateAuthoritySchema,
} from '@mediature/main/src/models/actions/authority';
import { AgentWrapperSchemaType } from '@mediature/main/src/models/entities/agent';
import { AttachmentKindSchema } from '@mediature/main/src/models/entities/attachment';
import { AuthorityWrapperSchemaType, PublicFacingAuthoritySchema } from '@mediature/main/src/models/entities/authority';
import { isUserAnAgentPartOfAuthority } from '@mediature/main/src/server/routers/case';
import { formatSafeAttachmentsToProcess } from '@mediature/main/src/server/routers/common/attachment';
import {
  agentPrismaToModel,
  attachmentIdPrismaToModel,
  attachmentPrismaToModel,
  authorityPrismaToModel,
} from '@mediature/main/src/server/routers/mappers';
import { privateProcedure, publicProcedure, router } from '@mediature/main/src/server/trpc';
import { formatSearchQuery } from '@mediature/main/src/utils/prisma';

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

export async function requiresThereIsNoSimilarAuthority(
  authorityName: string,
  authoritySlug: string | undefined,
  excludeAuthorityId?: string
): Promise<void> {
  const existingAuthority = await prisma.authority.findFirst({
    where: {
      name: authorityName,
      OR: authoritySlug
        ? {
            slug: authoritySlug,
          }
        : undefined,
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

    const { attachmentsToAdd, markNewAttachmentsAsUsed } = await formatSafeAttachmentsToProcess(
      AttachmentKindSchema.Values.AUTHORITY_LOGO,
      input.logoAttachmentId ? [input.logoAttachmentId] : [],
      []
    );

    const newAuthority = await prisma.authority.create({
      data: {
        name: input.name,
        slug: input.slug,
        type: input.type,
        logo: attachmentsToAdd.length
          ? {
              connect: {
                id: attachmentsToAdd[0],
              },
            }
          : undefined,
      },
    });

    await markNewAttachmentsAsUsed();

    return newAuthority;
  }),
  updateAuthority: privateProcedure.input(UpdateAuthoritySchema).mutation(async ({ ctx, input }) => {
    if (!(await isUserAnAdmin(ctx.user.id))) {
      throw new Error(`vous devez être un administrateur pour effectuer cette action`);
    }

    await requiresThereIsNoSimilarAuthority(input.name, undefined, input.authorityId);

    const authority = await prisma.authority.findUniqueOrThrow({
      where: {
        id: input.authorityId,
      },
    });

    const { attachmentsToAdd, attachmentsToRemove, markNewAttachmentsAsUsed } = await formatSafeAttachmentsToProcess(
      AttachmentKindSchema.Values.AUTHORITY_LOGO,
      input.logoAttachmentId ? [input.logoAttachmentId] : [],
      authority.logoAttachmentId ? [authority.logoAttachmentId] : []
    );

    const updatedAuthority = await prisma.authority.update({
      where: {
        id: input.authorityId,
      },
      data: {
        name: input.name,
        type: input.type,
        logo: {
          connect: attachmentsToAdd.length
            ? {
                id: attachmentsToAdd[0],
              }
            : undefined,
          disconnect: attachmentsToRemove.length ? true : undefined,
        },
      },
    });

    await markNewAttachmentsAsUsed();

    return updatedAuthority;
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
    const authorityId = input.id;

    if (!(await isUserAnAdmin(ctx.user.id)) && !(await isUserAnAgentPartOfAuthority(authorityId, ctx.user.id))) {
      throw new Error(`vous devez être médiateur de la collectivité ou administrateur pour effectuer cette action`);
    }

    const authority = await prisma.authority.findUnique({
      where: {
        id: authorityId,
      },
    });

    if (!authority) {
      throw new Error(`aucune collectivité trouvée`);
    }

    return {
      authority: await authorityPrismaToModel(authority),
    };
  }),
  getPublicFacingAuthority: publicProcedure.input(GetPublicFacingAuthoritySchema).query(async ({ ctx, input }) => {
    const authority = await prisma.authority.findUnique({
      where: {
        slug: input.slug,
      },
    });

    if (!authority) {
      throw new Error(`aucune collectivité trouvée`);
    }

    return {
      authority: PublicFacingAuthoritySchema.parse({
        ...authority,
        logo: await attachmentIdPrismaToModel(authority.logoAttachmentId),
      }),
    };
  }),
  listAuthorities: privateProcedure.input(ListAuthoritiesSchema).query(async ({ ctx, input }) => {
    if (!(await isUserAnAdmin(ctx.user.id))) {
      throw new Error(`vous devez être un administrateur pour effectuer cette action`);
    }

    let formattedSearchQuery: string | undefined;
    if (input.filterBy.query) {
      formattedSearchQuery = formatSearchQuery(input.filterBy.query);
    }

    const authorities = await prisma.authority.findMany({
      where: {
        name: input.filterBy.query
          ? {
              search: formattedSearchQuery,
              mode: 'insensitive',
            }
          : undefined,
        slug: input.filterBy.query
          ? {
              search: formattedSearchQuery,
              mode: 'insensitive',
            }
          : undefined,
        // TODO: pagination
      },
      include: {
        mainAgent: {
          include: {
            user: true,
            AuthorityWhereMainAgent: {
              select: { id: true },
            },
          },
        },
        Agent: {
          include: {
            user: true,
            AuthorityWhereMainAgent: {
              select: { id: true },
            },
          },
        },
        Case: {
          select: {
            closedAt: true,
          },
        },
      },
    });

    return {
      authoritiesWrappers: await Promise.all(
        authorities.map(async (authority): Promise<AuthorityWrapperSchemaType> => {
          let openCases: number = 0;
          let closeCases: number = 0;
          for (const authorityCase of authority.Case) {
            if (authorityCase.closedAt) {
              closeCases++;
            } else {
              openCases++;
            }
          }

          return {
            authority: await authorityPrismaToModel(authority),
            mainAgent: authority.mainAgent ? agentPrismaToModel(authority.mainAgent) : null,
            agents: authority.Agent.map((agent) => {
              return agentPrismaToModel(agent);
            }),
            openCases: openCases,
            closeCases: closeCases,
          };
        })
      ),
    };
  }),
});
