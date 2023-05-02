import { AttachmentKind, AttachmentStatus, CaseAttachmentType, CaseDomainItem, Note } from '@prisma/client';
import { renderToStream } from '@react-pdf/renderer';
import addresscompiler from 'addresscompiler';

import { prisma } from '@mediature/main/prisma/client';
import { mailer } from '@mediature/main/src/emails/mailer';
import { useServerTranslation } from '@mediature/main/src/i18n';
import {
  AddAttachmentToCaseSchema,
  AddNoteToCaseSchema,
  AssignCaseSchema,
  CreateCaseCompetentThirdPartyItemSchema,
  CreateCaseDomainItemSchema,
  DeleteCaseCompetentThirdPartyItemSchema,
  DeleteCaseDomainItemSchema,
  EditCaseCompetentThirdPartyItemSchema,
  EditCaseDomainItemSchema,
  GenerateCsvFromCaseAnalyticsSchema,
  GeneratePdfFromCaseSchema,
  GetCaseCompetentThirdPartyItemsSchema,
  GetCaseDomainItemsSchema,
  GetCaseSchema,
  ListCasesSchema,
  RemoveAttachmentFromCaseSchema,
  RemoveNoteFromCaseSchema,
  RequestCaseSchema,
  UnassignCaseSchema,
  UpdateCaseAttachmentLabelSchema,
  UpdateCaseNoteSchema,
  UpdateCaseSchema,
  requestCaseAttachmentsMax,
  updateCaseAttachmentsMax,
} from '@mediature/main/src/models/actions/case';
import { AttachmentKindSchema } from '@mediature/main/src/models/entities/attachment';
import { CasePlatformSchema, CaseStatusSchema, CaseWrapperSchema, CaseWrapperSchemaType } from '@mediature/main/src/models/entities/case';
import { PhoneTypeSchema } from '@mediature/main/src/models/entities/phone';
import { isUserAnAdmin } from '@mediature/main/src/server/routers/authority';
import { formatSafeAttachmentsToProcess, uploadCsvFile, uploadPdfFile } from '@mediature/main/src/server/routers/common/attachment';
import {
  agentPrismaToModel,
  attachmentIdPrismaToModel,
  attachmentPrismaToModel,
  caseCompetentThirdPartyItemPrismaToModel,
  caseCompetentThirdPartyItemsPrismaToModel,
  caseDomainItemPrismaToModel,
  caseDomainItemsPrismaToModel,
  caseNotePrismaToModel,
  casePrismaToModel,
  citizenPrismaToModel,
} from '@mediature/main/src/server/routers/mappers';
import { privateProcedure, publicProcedure, router } from '@mediature/main/src/server/trpc';
import { attachmentKindList } from '@mediature/main/src/utils/attachment';
import { getCaseEmail } from '@mediature/main/src/utils/business/case';
import { caseAnalyticsPrismaToCsv } from '@mediature/main/src/utils/csv';
import { mailjetClient } from '@mediature/main/src/utils/mailjet';
import { linkRegistry } from '@mediature/main/src/utils/routes/registry';
import { CaseSynthesisDocument } from '@mediature/ui/src/documents/templates/CaseSynthesis';

export async function isAgentPartOfAuthority(authorityId: string, agentId: string): Promise<boolean> {
  const agent = await prisma.agent.findFirst({
    where: {
      id: agentId,
      authorityId: authorityId,
    },
  });

  return !!agent;
}

export async function isUserAnAgentPartOfAuthorities(authorityIds: string[], userId: string): Promise<boolean> {
  // Remove duplicates
  authorityIds = authorityIds.filter((x, i, a) => a.indexOf(x) == i);

  const authoritiesCount = await prisma.authority.count({
    where: {
      id: {
        in: authorityIds,
      },
      Agent: {
        some: {
          user: {
            id: userId,
          },
        },
      },
    },
  });

  return authorityIds.length === authoritiesCount;
}

export async function isUserAnAgentPartOfAuthority(authorityId: string, userId: string): Promise<boolean> {
  return await isUserAnAgentPartOfAuthorities([authorityId], userId);
}

export async function isAgentThisUser(userId: string, agentId: string): Promise<boolean> {
  const agent = await prisma.agent.findFirst({
    where: {
      id: agentId,
      userId: userId,
    },
  });

  return !!agent;
}

export async function canUserManageThisCase(userId: string, caseId: string): Promise<boolean> {
  const targetedCase = await prisma.case.findFirst({
    where: {
      id: caseId,
    },
  });
  if (!targetedCase) {
    throw new Error(`ce dossier n'existe pas`);
  }

  if (!targetedCase.agentId || !(await isAgentThisUser(userId, targetedCase.agentId))) {
    throw new Error(`vous devez être assigné au dossier pour effectuer cette opération`);
  }

  return true;
}

export async function assertCaseDomainParentItemIsAllowed(parentItemId: string, expectedAuthorityId?: string): Promise<void> {
  const parentItem = await prisma.caseDomainItem.findUniqueOrThrow({
    where: {
      id: parentItemId,
    },
  });

  if (!!parentItem.parentItemId) {
    throw new Error(`vous ne pouvez que créer des domaines de niveau 1 ou 2`);
  } else if (!!expectedAuthorityId && parentItem.authorityId !== null && expectedAuthorityId !== parentItem.authorityId) {
    throw new Error(`vous ne pouvez rattacher votre domaine qu'à un domaine de la plateforme ou de votre propre collectivité`);
  } else if (!expectedAuthorityId && parentItem.authorityId !== null) {
    throw new Error(`vous ne pouvez rattacher votre domaine de plateforme qu'à un autre domaine de plateforme`);
  }
}

export async function assertCaseCompetentThirdPartyParentItemIsAllowed(parentItemId: string, expectedAuthorityId?: string): Promise<void> {
  const parentItem = await prisma.caseCompetentThirdPartyItem.findUniqueOrThrow({
    where: {
      id: parentItemId,
    },
  });

  if (!!parentItem.parentItemId) {
    throw new Error(`vous ne pouvez que créer des entités tierces de niveau 1 ou 2`);
  } else if (!!expectedAuthorityId && parentItem.authorityId !== null && expectedAuthorityId !== parentItem.authorityId) {
    throw new Error(`vous ne pouvez rattacher votre entité tierce qu'à une entité de la plateforme ou de votre propre collectivité`);
  } else if (!expectedAuthorityId && parentItem.authorityId !== null) {
    throw new Error(`vous ne pouvez rattacher votre entité tierce de plateforme qu'à un autre entité de plateforme`);
  }
}

export const caseRouter = router({
  requestCase: publicProcedure.input(RequestCaseSchema).mutation(async ({ ctx, input }) => {
    const { attachmentsToAdd, markNewAttachmentsAsUsed } = await formatSafeAttachmentsToProcess(
      AttachmentKindSchema.Values.CASE_DOCUMENT,
      input.attachments,
      [],
      {
        maxAttachmentsTotal: requestCaseAttachmentsMax,
      }
    );

    const newCase = await prisma.case.create({
      data: {
        alreadyRequestedInThePast: input.alreadyRequestedInThePast,
        gotAnswerFromPreviousRequest: input.gotAnswerFromPreviousRequest,
        description: input.description,
        competent: null,
        units: '', // TODO
        emailCopyWanted: input.emailCopyWanted,
        termReminderAt: null,
        initiatedFrom: CasePlatformSchema.Values.WEB,
        status: CaseStatusSchema.Values.TO_PROCESS,
        closedAt: null,
        outcome: null,
        collectiveAgreement: null,
        administrativeCourtNext: null,
        finalConclusion: null,
        nextRequirements: null,
        citizen: {
          create: {
            email: input.email,
            firstname: input.firstname,
            lastname: input.lastname,
            address: {
              create: {
                street: input.address.street,
                city: input.address.city,
                postalCode: input.address.postalCode,
                countryCode: input.address.countryCode,
                subdivision: input.address.subdivision,
              },
            },
            phone: {
              create: {
                phoneType: input.phone.phoneType,
                callingCode: input.phone.callingCode,
                countryCode: input.phone.countryCode,
                number: input.phone.number,
              },
            },
          },
        },
        authority: {
          connect: {
            id: input.authorityId,
          },
        },
        AttachmentsOnCases: {
          createMany: {
            skipDuplicates: true,
            data: attachmentsToAdd.map((attachmentId) => {
              return {
                attachmentId: attachmentId,
                transmitter: CaseAttachmentType.CITIZEN,
              };
            }),
          },
        },
      },
      include: {
        citizen: true,
        authority: true,
        domain: {
          include: {
            parentItem: true,
          },
        },
        competentThirdParty: {
          include: {
            parentItem: true,
          },
        },
      },
    });

    const { t } = useServerTranslation('common');

    // TODO: must be in a queue as for the email sending?
    await mailjetClient.createInboundEmail(getCaseEmail(t, newCase.humanId.toString()));

    // If an email has been specified, notify the user of the case information
    if (!!newCase.citizen.email) {
      const sender = addresscompiler.compile({
        address: getCaseEmail(t, newCase.humanId.toString()),
        name: 'Médiature',
      });

      await mailer.sendCaseRequestConfirmation({
        sender: sender,
        recipient: newCase.citizen.email,
        firstname: newCase.citizen.firstname,
        lastname: newCase.citizen.lastname,
        caseHumanId: newCase.humanId.toString(),
        authorityName: newCase.authority.name,
        submittedRequestData: input,
      });
    }

    await markNewAttachmentsAsUsed();

    // TODO: since public should return almost nothing? or nothing at all

    return {
      case: casePrismaToModel(newCase),
    };
  }),
  updateCase: privateProcedure.input(UpdateCaseSchema).mutation(async ({ ctx, input }) => {
    const targetedCase = await prisma.case.findUnique({
      where: {
        id: input.caseId,
      },
      include: {
        citizen: true,
        authority: true,
      },
    });

    if (!targetedCase) {
      throw new Error(`ce dossier n'existe pas`);
    }

    if (!(await isUserAnAgentPartOfAuthority(targetedCase.authorityId, ctx.user.id))) {
      throw new Error(`vous devez faire partie de la collectivité de ce dossier pour le mettre à jour`);
    }

    if (!!input.domainId) {
      const domain = await prisma.caseDomainItem.findUnique({
        where: {
          id: input.domainId,
        },
      });

      if (!domain) {
        throw new Error(`le domaine que vous essayez de lier n'existe pas`);
      } else if (domain.authorityId !== null && domain.authorityId !== targetedCase.authorityId) {
        throw new Error(`vous ne pouvez lier qu'un domaine de la plateforme ou un appartenant à votre collectivité`);
      }
    }

    if (!!input.competentThirdPartyId) {
      const competentThirdParty = await prisma.caseCompetentThirdPartyItem.findUnique({
        where: {
          id: input.competentThirdPartyId,
        },
      });

      if (!competentThirdParty) {
        throw new Error(`l'entité tierce que vous essayez de lier n'existe pas`);
      } else if (competentThirdParty.authorityId !== null && competentThirdParty.authorityId !== targetedCase.authorityId) {
        throw new Error(`vous ne pouvez lier qu'une entité tierce de la plateforme ou un appartenant à votre collectivité`);
      }
    }

    let closedAt: Date | null = null;
    let statusSwitchedToClose = false;
    if (input.close) {
      if (targetedCase.closedAt) {
        closedAt = targetedCase.closedAt;
      } else {
        closedAt = new Date();
        statusSwitchedToClose = true;
      }
    }

    const updatedCase = await prisma.case.update({
      where: {
        id: input.caseId,
      },
      data: {
        initiatedFrom: input.initiatedFrom,
        description: input.description,
        units: input.units,
        termReminderAt: input.termReminderAt,
        status: input.status,
        closedAt: closedAt,
        outcome: input.outcome,
        collectiveAgreement: input.collectiveAgreement,
        administrativeCourtNext: input.administrativeCourtNext,
        finalConclusion: input.finalConclusion,
        nextRequirements: input.nextRequirements,
        domain: {
          connect: input.domainId
            ? {
                id: input.domainId,
              }
            : undefined,
          disconnect: !input.domainId ? true : undefined,
        },
        competent: input.competent,
        competentThirdParty: {
          connect: input.competentThirdPartyId
            ? {
                id: input.competentThirdPartyId,
              }
            : undefined,
          disconnect: !input.competentThirdPartyId ? true : undefined,
        },
        citizen: {
          update: {
            address: {
              update: {
                street: input.address.street,
                city: input.address.city,
                postalCode: input.address.postalCode,
                countryCode: input.address.countryCode,
                subdivision: input.address.subdivision,
              },
            },
            phone: {
              update: {
                phoneType: input.phone.phoneType,
                callingCode: input.phone.callingCode,
                countryCode: input.phone.countryCode,
                number: input.phone.number,
              },
            },
          },
        },
      },
      include: {
        citizen: {
          include: {
            address: true,
            phone: true,
          },
        },
        domain: {
          include: {
            parentItem: true,
          },
        },
        competentThirdParty: {
          include: {
            parentItem: true,
          },
        },
      },
    });

    if (statusSwitchedToClose && !!targetedCase.citizen.email) {
      const { t } = useServerTranslation('common');

      const sender = addresscompiler.compile({
        address: getCaseEmail(t, targetedCase.humanId.toString()),
        name: 'Médiature',
      });

      await mailer.sendCaseClosed({
        sender: sender,
        recipient: targetedCase.citizen.email,
        firstname: targetedCase.citizen.firstname,
        lastname: targetedCase.citizen.lastname,
        caseHumanId: targetedCase.humanId.toString(),
        authorityName: targetedCase.authority.name,
      });
    }

    return {
      caseWrapper: CaseWrapperSchema.parse({
        case: casePrismaToModel(updatedCase),
        citizen: citizenPrismaToModel(updatedCase.citizen),
        // No need to provide the ones below for the UI for now
        agent: null,
        notes: null,
        attachments: null,
      }),
    };
  }),
  assignCase: privateProcedure.input(AssignCaseSchema).mutation(async ({ ctx, input }) => {
    const targetedCase = await prisma.case.findFirst({
      where: {
        id: input.caseId,
      },
    });
    if (!targetedCase) {
      throw new Error(`ce dossier n'existe pas`);
    }

    if (targetedCase.agentId) {
      throw new Error(`un médiateur est déjà assigné sur ce dossier, il doit d'abord s'enlever pour que assigner une autre personne`);
    }

    let agentIdToAssign: string;
    if (input.myself) {
      const userAgent = await prisma.agent.findFirstOrThrow({
        where: {
          userId: ctx.user.id,
          authorityId: targetedCase.authorityId,
        },
      });

      agentIdToAssign = userAgent.id;
    } else {
      agentIdToAssign = input.agentId || '';
    }

    if (!(await isAgentPartOfAuthority(targetedCase.authorityId, agentIdToAssign))) {
      throw new Error(`impossible d'assigner un médiateur qui ne fait pas partie de la collectivité du dossier`);
    }

    if (!(await isAgentThisUser(ctx.user.id, agentIdToAssign))) {
      throw new Error(`vous ne pouvez assigner que vous-même à un dossier`);

      // await mailer.sendCaseAssignedBySomeone({
      //   recipient: assignedUser.email,
      //   firstname: assignedUser.firstname,
      //   originatorFirstname: originatorUser.firstname,
      //   originatorLastname: originatorUser.lastname,
      //   caseUrl: linkRegistry.get('case', { authorityId: targetedCase.authorityId, caseId: targetedCase.id }, { absolute: true }),
      //   caseHumanId: targetedCase.humanId.toString(),
      // });
    }

    const assignedCase = await prisma.case.update({
      where: {
        id: input.caseId,
      },
      data: {
        agent: {
          connect: {
            id: agentIdToAssign,
          },
        },
      },
    });

    return { case: casePrismaToModel(assignedCase) };
  }),
  unassignCase: privateProcedure.input(UnassignCaseSchema).mutation(async ({ ctx, input }) => {
    const agentIdToUnassign = input.agentId;

    const targetedCase = await prisma.case.findFirst({
      where: {
        id: input.caseId,
      },
    });
    if (!targetedCase) {
      throw new Error(`ce dossier n'existe pas`);
    }

    if (!targetedCase.agentId) {
      throw new Error(`aucun médiateur n'est assigné sur ce dossier`);
    }

    if (!(await isAgentThisUser(ctx.user.id, agentIdToUnassign))) {
      throw new Error(`vous ne pouvez désassigner que vous-même d'un dossier`);
    }

    const unassignedCase = await prisma.case.update({
      where: {
        id: input.caseId,
      },
      data: {
        agent: {
          disconnect: true,
        },
      },
    });

    return { case: casePrismaToModel(unassignedCase) };
  }),
  getCaseDomainItems: privateProcedure.input(GetCaseDomainItemsSchema).query(async ({ ctx, input }) => {
    if (!!input.authorityId && !(await isUserAnAgentPartOfAuthority(input.authorityId, ctx.user.id))) {
      throw new Error(`vous devez faire partie de la collectivité pour récupérer ses domaines`);
    } else if (!(await isUserAnAdmin(ctx.user.id))) {
      throw new Error(`vous devez être un administrateur pour effectuer cette action`);
    }

    const items = await prisma.caseDomainItem.findMany({
      where: {
        OR: [
          {
            authorityId: input.authorityId,
          },
          {
            authorityId: null,
          },
        ],
      },
    });

    return {
      items: caseDomainItemsPrismaToModel(items),
    };
  }),
  createCaseDomainItem: privateProcedure.input(CreateCaseDomainItemSchema).mutation(async ({ ctx, input }) => {
    if (!!input.authorityId && !(await isUserAnAgentPartOfAuthority(input.authorityId, ctx.user.id))) {
      throw new Error(`vous devez faire partie de la collectivité pour lui créer un domaine`);
    } else if (!(await isUserAnAdmin(ctx.user.id))) {
      throw new Error(`vous devez être un administrateur pour effectuer cette action`);
    }

    if (!!input.parentId) {
      await assertCaseDomainParentItemIsAllowed(input.parentId, input.authorityId || undefined);
    }

    const item = await prisma.caseDomainItem.create({
      data: {
        name: input.name,
        authority: !!input.authorityId
          ? {
              connect: {
                id: input.authorityId,
              },
            }
          : undefined,
        parentItem: !!input.parentId
          ? {
              connect: {
                id: input.parentId,
              },
            }
          : undefined,
      },
      include: {
        parentItem: true,
      },
    });

    return { item: caseDomainItemPrismaToModel(item, item.parentItem || undefined) };
  }),
  editCaseDomainItem: privateProcedure.input(EditCaseDomainItemSchema).mutation(async ({ ctx, input }) => {
    const item = await prisma.caseDomainItem.findUnique({
      where: {
        id: input.itemId,
      },
    });

    if (!item) {
      throw new Error(`ce domaine n'existe pas`);
    } else if (!(await isUserAnAdmin(ctx.user.id))) {
      throw new Error(`vous devez être un administrateur pour effectuer cette action`);
    } else if (!!item.authorityId && !(await isUserAnAgentPartOfAuthority(item.authorityId, ctx.user.id))) {
      throw new Error(`vous devez faire partie de la collectivité pour modifier l'un de ses domaines`);
    }

    if (!!input.parentId) {
      await assertCaseDomainParentItemIsAllowed(input.parentId, item.authorityId || undefined);
    }

    const updatedItem = await prisma.caseDomainItem.update({
      where: {
        id: item.id,
      },
      data: {
        name: input.name,
        parentItem: !!input.parentId
          ? {
              connect: {
                id: input.parentId,
              },
            }
          : undefined,
      },
      include: {
        parentItem: true,
      },
    });

    return { item: caseDomainItemPrismaToModel(updatedItem, updatedItem.parentItem || undefined) };
  }),
  deleteCaseDomainItem: privateProcedure.input(DeleteCaseDomainItemSchema).mutation(async ({ ctx, input }) => {
    if (!!input.authorityId && !(await isUserAnAgentPartOfAuthority(input.authorityId, ctx.user.id))) {
      throw new Error(`vous devez faire partie de la collectivité pour lui supprimer un domaine`);
    } else if (!(await isUserAnAdmin(ctx.user.id))) {
      throw new Error(`vous devez être un administrateur pour effectuer cette action`);
    }

    const item = await prisma.caseDomainItem.findFirst({
      where: {
        id: input.itemId,
        authorityId: input.authorityId,
      },
      include: {
        _count: {
          select: {
            childrenItems: true,
            Case: true,
          },
        },
      },
    });
    if (!item) {
      throw new Error(`ce domaine n'existe pas`);
    } else if (item._count.Case > 0) {
      throw new Error(`aucun dossier ne doit être lié à ce domaine pour pouvoir être supprimé`);
    } else if (item._count.childrenItems > 0) {
      throw new Error(`aucun "domaine enfant" ne doit être lié à ce domaine pour pouvoir être supprimé`);
    }

    const deletedItem = await prisma.caseDomainItem.delete({
      where: {
        id: input.itemId,
      },
    });

    return;
  }),
  getCaseCompetentThirdPartyItems: privateProcedure.input(GetCaseCompetentThirdPartyItemsSchema).query(async ({ ctx, input }) => {
    if (!!input.authorityId && !(await isUserAnAgentPartOfAuthority(input.authorityId, ctx.user.id))) {
      throw new Error(`vous devez faire partie de la collectivité pour récupérer ses entités tierces`);
    } else if (!(await isUserAnAdmin(ctx.user.id))) {
      throw new Error(`vous devez être un administrateur pour effectuer cette action`);
    }

    const items = await prisma.caseCompetentThirdPartyItem.findMany({
      where: {
        OR: [
          {
            authorityId: input.authorityId,
          },
          {
            authorityId: null,
          },
        ],
      },
    });

    return {
      items: caseCompetentThirdPartyItemsPrismaToModel(items),
    };
  }),
  createCaseCompetentThirdPartyItem: privateProcedure.input(CreateCaseCompetentThirdPartyItemSchema).mutation(async ({ ctx, input }) => {
    if (!!input.authorityId && !(await isUserAnAgentPartOfAuthority(input.authorityId, ctx.user.id))) {
      throw new Error(`vous devez faire partie de la collectivité pour lui créer une entité tierce`);
    } else if (!(await isUserAnAdmin(ctx.user.id))) {
      throw new Error(`vous devez être un administrateur pour effectuer cette action`);
    }

    if (!!input.parentId) {
      await assertCaseCompetentThirdPartyParentItemIsAllowed(input.parentId, input.authorityId || undefined);
    }

    const item = await prisma.caseCompetentThirdPartyItem.create({
      data: {
        name: input.name,
        authority: !!input.authorityId
          ? {
              connect: {
                id: input.authorityId,
              },
            }
          : undefined,
        parentItem: !!input.parentId
          ? {
              connect: {
                id: input.parentId,
              },
            }
          : undefined,
      },
      include: {
        parentItem: true,
      },
    });

    return { item: caseCompetentThirdPartyItemPrismaToModel(item, item.parentItem || undefined) };
  }),
  editCaseCompetentThirdPartyItem: privateProcedure.input(EditCaseCompetentThirdPartyItemSchema).mutation(async ({ ctx, input }) => {
    const item = await prisma.caseCompetentThirdPartyItem.findUnique({
      where: {
        id: input.itemId,
      },
    });

    if (!item) {
      throw new Error(`cette entité tierce n'existe pas`);
    } else if (!(await isUserAnAdmin(ctx.user.id))) {
      throw new Error(`vous devez être un administrateur pour effectuer cette action`);
    } else if (!!item.authorityId && !(await isUserAnAgentPartOfAuthority(item.authorityId, ctx.user.id))) {
      throw new Error(`vous devez faire partie de la collectivité pour modifier l'une de ses entités tierces`);
    }

    if (!!input.parentId) {
      await assertCaseCompetentThirdPartyParentItemIsAllowed(input.parentId, item.authorityId || undefined);
    }

    const updatedItem = await prisma.caseCompetentThirdPartyItem.update({
      where: {
        id: item.id,
      },
      data: {
        name: input.name,
        parentItem: !!input.parentId
          ? {
              connect: {
                id: input.parentId,
              },
            }
          : undefined,
      },
      include: {
        parentItem: true,
      },
    });

    return { item: caseCompetentThirdPartyItemPrismaToModel(updatedItem, updatedItem.parentItem || undefined) };
  }),
  deleteCaseCompetentThirdPartyItem: privateProcedure.input(DeleteCaseCompetentThirdPartyItemSchema).mutation(async ({ ctx, input }) => {
    if (!!input.authorityId && !(await isUserAnAgentPartOfAuthority(input.authorityId, ctx.user.id))) {
      throw new Error(`vous devez faire partie de la collectivité pour lui supprimer une entité tierce`);
    } else if (!(await isUserAnAdmin(ctx.user.id))) {
      throw new Error(`vous devez être un administrateur pour effectuer cette action`);
    }

    const item = await prisma.caseCompetentThirdPartyItem.findFirst({
      where: {
        id: input.itemId,
        authorityId: input.authorityId,
      },
      include: {
        _count: {
          select: {
            childrenItems: true,
            Case: true,
          },
        },
      },
    });
    if (!item) {
      throw new Error(`cette entité tierce n'existe pas`);
    } else if (item._count.Case > 0) {
      throw new Error(`aucun dossier ne doit être lié à cette entité tierce pour pouvoir être supprimée`);
    } else if (item._count.childrenItems > 0) {
      throw new Error(`aucune "entité tierce enfant" ne doit être liée à cette entité pour pouvoir être supprimée`);
    }

    const deletedItem = await prisma.caseCompetentThirdPartyItem.delete({
      where: {
        id: input.itemId,
      },
    });

    return;
  }),
  getCase: privateProcedure.input(GetCaseSchema).query(async ({ ctx, input }) => {
    const targetedCase = await prisma.case.findUnique({
      where: {
        id: input.id,
      },
      include: {
        citizen: {
          include: {
            address: true,
            phone: true,
          },
        },
        agent: {
          include: {
            user: true,
            AuthorityWhereMainAgent: {
              select: { id: true },
            },
          },
        },
        domain: {
          include: {
            parentItem: true,
          },
        },
        Note: true,
        AttachmentsOnCases: {
          include: {
            attachment: {
              select: {
                id: true,
                contentType: true,
                name: true,
                size: true,
              },
            },
          },
        },
      },
    });

    if (!targetedCase) {
      throw new Error(`ce dossier n'existe pas`);
    } else if (!(await isUserAnAgentPartOfAuthority(targetedCase.authorityId, ctx.user.id))) {
      throw new Error(`en tant que médiateur vous ne pouvez qu'accéder aux dossiers concernant votre collectivité`);
    }

    const attachments = await Promise.all(
      targetedCase.AttachmentsOnCases.map(async (attachmentOnCase) => {
        return await attachmentPrismaToModel(attachmentOnCase.attachment);
      })
    );

    return {
      caseWrapper: CaseWrapperSchema.parse({
        case: casePrismaToModel(targetedCase),
        citizen: citizenPrismaToModel(targetedCase.citizen),
        agent: targetedCase.agent ? agentPrismaToModel(targetedCase.agent) : null,
        notes: targetedCase.Note.map((note: Note) => caseNotePrismaToModel(note)),
        attachments: attachments,
      }),
    };
  }),
  listCases: privateProcedure.input(ListCasesSchema).query(async ({ ctx, input }) => {
    const isAdmin = await isUserAnAdmin(ctx.user.id);

    if (!isAdmin) {
      if (
        !input.filterBy.authorityIds ||
        input.filterBy.authorityIds.length !== 1 ||
        !(await isUserAnAgentPartOfAuthorities(input.filterBy.authorityIds, ctx.user.id))
      ) {
        throw new Error(`en tant que médiateur vous ne pouvez que rechercher les dossiers concernant votre collectivité`);
      }
    }

    let humandIdSearch: number | undefined;
    if (input.filterBy.query) {
      const value = parseInt(input.filterBy.query);

      if (!isNaN(value)) {
        humandIdSearch = value;
      }
    }

    const cases = await prisma.case.findMany({
      where: {
        authorityId: input.filterBy.authorityIds
          ? {
              in: input.filterBy.authorityIds,
            }
          : undefined,
        agentId: {
          in: input.filterBy.agentIds || undefined,
          equals: input.filterBy.assigned === false ? null : undefined,
          not: input.filterBy.assigned === true ? null : undefined,
        },
        agent:
          input.filterBy.mine === true
            ? {
                userId: ctx.user.id,
              }
            : undefined,
        AND: input.filterBy.query
          ? [
              {
                OR: [
                  {
                    humanId: {
                      equals: humandIdSearch,
                    },
                  },
                  {
                    description: {
                      search: input.filterBy.query,
                      mode: 'insensitive',
                    },
                  },
                  {
                    citizen: {
                      firstname: {
                        search: input.filterBy.query,
                        mode: 'insensitive',
                      },
                    },
                  },
                  {
                    citizen: {
                      lastname: {
                        search: input.filterBy.query,
                        mode: 'insensitive',
                      },
                    },
                  },
                ],
              },
            ]
          : undefined,
      },
      include: {
        citizen: {
          include: {
            address: true,
            phone: true,
          },
        },
        agent: {
          include: {
            user: true,
            AuthorityWhereMainAgent: {
              select: { id: true },
            },
          },
        },
        domain: {
          include: {
            parentItem: true,
          },
        },
        AttachmentsOnCases: {
          include: {
            attachment: {
              select: {
                id: true,
                contentType: false,
                name: true,
                size: false,
              },
            },
          },
        },
      },
    });

    return {
      casesWrappers: await Promise.all(
        cases.map(async (iterationCase): Promise<CaseWrapperSchemaType> => {
          const attachments = await Promise.all(
            iterationCase.AttachmentsOnCases.map(async (attachmentOnCase) => {
              return await attachmentPrismaToModel(attachmentOnCase.attachment);
            })
          );

          return {
            case: casePrismaToModel(iterationCase),
            citizen: citizenPrismaToModel(iterationCase.citizen),
            agent: iterationCase.agent ? agentPrismaToModel(iterationCase.agent) : null,
            notes: null,
            attachments: attachments,
          };
        })
      ),
    };
  }),
  generatePdfFromCase: privateProcedure.input(GeneratePdfFromCaseSchema).mutation(async ({ ctx, input }) => {
    const targetedCase = await prisma.case.findUnique({
      where: {
        id: input.caseId,
      },
      include: {
        citizen: {
          include: {
            address: true,
            phone: true,
          },
        },
        domain: {
          include: {
            parentItem: true,
          },
        },
      },
    });

    if (!targetedCase) {
      throw new Error(`ce dossier n'existe pas`);
    } else if (!(await isUserAnAgentPartOfAuthority(targetedCase.authorityId, ctx.user.id))) {
      throw new Error(`en tant que médiateur vous ne pouvez qu'accéder aux dossiers concernant votre collectivité`);
    }

    const fileStream = await renderToStream(
      CaseSynthesisDocument({
        case: casePrismaToModel(targetedCase),
        citizen: citizenPrismaToModel(targetedCase.citizen),
      })
    );

    const { t } = useServerTranslation('common');

    const fileId = await uploadPdfFile({
      filename: `${t('model.case.technicalName', { humanId: targetedCase.humanId.toString() })}.pdf`,
      kind: attachmentKindList[AttachmentKindSchema.Values.CASE_SYNTHESIS],
      file: fileStream,
    });

    const attachmentUi = await attachmentIdPrismaToModel(fileId);

    return {
      attachment: attachmentUi,
    };
  }),
  generateCsvFromCaseAnalytics: privateProcedure.input(GenerateCsvFromCaseAnalyticsSchema).mutation(async ({ ctx, input }) => {
    if (!!input.authorityId && !(await isUserAnAgentPartOfAuthority(input.authorityId, ctx.user.id))) {
      throw new Error(`vous devez faire partie de la collectivité de ce dossier pour le mettre à jour`);
    } else if (!input.authorityId && !(await isUserAnAdmin(ctx.user.id))) {
      throw new Error(`vous devez être un administrateur pour effectuer cette action`);
    }

    const { t } = useServerTranslation('common');

    let filenameBase: string;
    if (!!input.authorityId) {
      const authority = await prisma.authority.findUniqueOrThrow({
        where: {
          id: input.authorityId,
        },
      });

      filenameBase = t('document.template.CaseAnalytics.naming.authorityFilename', { authorityName: authority.name });
    } else {
      filenameBase = t('document.template.CaseAnalytics.naming.globalFilename');
    }

    // For now it's synchronous and not a stream since not supported (https://github.com/prisma/prisma/issues/5055)
    // Everything needs to fit in memory, it should not be an issue for now
    const analytics = await prisma.caseAnalytics.findMany({
      where: {
        authorityId: input.authorityId || undefined,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const csvString = caseAnalyticsPrismaToCsv(analytics);

    const fileId = await uploadCsvFile({
      filename: `${filenameBase}.csv`,
      kind: attachmentKindList[AttachmentKindSchema.Values.CASES_ANALYTICS],
      fileContent: csvString,
    });

    const attachmentUi = await attachmentIdPrismaToModel(fileId);

    return {
      attachment: attachmentUi,
    };
  }),
  addNoteToCase: privateProcedure.input(AddNoteToCaseSchema).mutation(async ({ ctx, input }) => {
    await canUserManageThisCase(ctx.user.id, input.caseId);

    const note = await prisma.note.create({
      data: {
        date: input.date,
        content: input.content,
        case: {
          connect: {
            id: input.caseId,
          },
        },
      },
    });

    return { note: note };
  }),
  removeNoteFromCase: privateProcedure.input(RemoveNoteFromCaseSchema).mutation(async ({ ctx, input }) => {
    const targetedCase = await prisma.case.findFirst({
      where: {
        Note: {
          some: {},
          every: {
            id: {
              equals: input.noteId,
            },
          },
        },
      },
    });
    if (!targetedCase) {
      throw new Error(`ce dossier n'existe pas`);
    }

    await canUserManageThisCase(ctx.user.id, targetedCase.id);

    const note = await prisma.note.delete({
      where: {
        id: input.noteId,
      },
    });

    return;
  }),
  updateCaseNote: privateProcedure.input(UpdateCaseNoteSchema).mutation(async ({ ctx, input }) => {
    const targetedCase = await prisma.case.findFirst({
      where: {
        Note: {
          some: {},
          every: {
            id: {
              equals: input.noteId,
            },
          },
        },
      },
    });
    if (!targetedCase) {
      throw new Error(`ce dossier n'existe pas`);
    }

    await canUserManageThisCase(ctx.user.id, targetedCase.id);

    const note = await prisma.note.update({
      where: {
        id: input.noteId,
      },
      data: {
        date: input.date,
        content: input.content,
      },
    });

    return { note };
  }),
  addAttachmentToCase: privateProcedure.input(AddAttachmentToCaseSchema).mutation(async ({ ctx, input }) => {
    await canUserManageThisCase(ctx.user.id, input.caseId);

    const attachmentsOnCase = await prisma.attachmentsOnCases.findMany({
      where: {
        caseId: input.caseId,
      },
    });

    const { attachmentsToAdd, markNewAttachmentsAsUsed } = await formatSafeAttachmentsToProcess(
      AttachmentKindSchema.Values.CASE_DOCUMENT,
      [input.attachmentId],
      attachmentsOnCase.map((attachmentOnCase) => attachmentOnCase.attachmentId),
      {
        maxAttachmentsTotal: updateCaseAttachmentsMax,
      }
    );

    const targetedCase = await prisma.case.update({
      where: {
        id: input.caseId,
      },
      data: {
        AttachmentsOnCases: {
          createMany: {
            skipDuplicates: true,
            data: attachmentsToAdd.map((attachmentId) => {
              return {
                attachmentId: attachmentId,
                transmitter: CaseAttachmentType.AGENT,
              };
            }),
          },
        },
      },
    });

    await markNewAttachmentsAsUsed();

    return;
  }),
  removeAttachmentFromCase: privateProcedure.input(RemoveAttachmentFromCaseSchema).mutation(async ({ ctx, input }) => {
    await canUserManageThisCase(ctx.user.id, input.caseId);

    const attachmentOnCase = await prisma.attachmentsOnCases.findUnique({
      where: {
        caseId_attachmentId: {
          caseId: input.caseId,
          attachmentId: input.attachmentId,
        },
      },
    });
    if (!attachmentOnCase) {
      throw new Error(`le document pour ce dossier n'existe pas`);
    }

    // Delete cascaded to `attachmentOnCase`
    const attachment = await prisma.attachment.delete({
      where: {
        id: attachmentOnCase.attachmentId,
      },
    });

    return;
  }),
  updateCaseAttachment: privateProcedure.input(UpdateCaseAttachmentLabelSchema).mutation(async ({ ctx, input }) => {
    const targetedCase = await prisma.case.findFirst({
      where: {
        AttachmentsOnCases: {
          some: {},
          every: {
            attachmentId: {
              equals: input.attachmentId,
            },
          },
        },
      },
    });
    if (!targetedCase) {
      throw new Error(`ce dossier n'existe pas`);
    }

    await canUserManageThisCase(ctx.user.id, targetedCase.id);

    await prisma.attachmentsOnCases.update({
      where: {
        caseId_attachmentId: {
          caseId: targetedCase.id,
          attachmentId: input.attachmentId,
        },
      },
      data: {
        transmitter: input.transmitter,
      },
    });

    return;
  }),
});
