import { AttachmentKind, AttachmentStatus, CaseAttachmentType, CaseDomainItem, CaseStatus, Note } from '@prisma/client';
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
  DeleteCaseSchema,
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
  UpdateCaseAttachmentLabelSchema,
  UpdateCaseNoteSchema,
  UpdateCaseSchema,
  requestCaseAttachmentsMax,
  updateCaseAttachmentsMax,
} from '@mediature/main/src/models/actions/case';
import { AttachmentKindSchema } from '@mediature/main/src/models/entities/attachment';
import {
  CasePlatformSchema,
  CaseSchemaType,
  CaseStatusSchema,
  CaseStatusSchemaType,
  CaseWrapperSchema,
  CaseWrapperSchemaType,
} from '@mediature/main/src/models/entities/case';
import {
  adminRoleRequiredError,
  agentCanOnlyAccessItsAuthorityCasesError,
  agentCanOnlySeeAuthorityCasesError,
  assignedToCaseOrAuthorityMainAgentRoleRequiredError,
  authorityAgentRoleRequiredError,
  authorityMainAgentRoleRequiredError,
  cannotAssignAgentFromAnotherAuthorityError,
  cannotAssignYourselfIfAlreadyAssignedError,
  caseNotFoundError,
  competentThirdPartyCreationMustBeLowLevelError,
  competentThirdPartyMustBeScopedCorrectlyError,
  competentThirdPartyNotFoundError,
  competentThirdPartyToBindNotFoundError,
  documentNotFoundError,
  domainCreationMustBeLowLevelError,
  domainMustBeScopedCorrectlyError,
  domainNotFoundError,
  domainToBindNotFoundError,
  globalCompetentThirdPartyMustBeScopedCorrectlyError,
  globalDomainMustBeScopedCorrectlyError,
  mustBeAssignedToThisCaseError,
  mustBePartOfAuthorityToCreateCaseCompetentThirdPartyError,
  mustBePartOfAuthorityToCreateCaseDomainError,
  mustBePartOfAuthorityToDeleteCaseCompetentThirdPartyError,
  mustBePartOfAuthorityToDeleteCaseDomainError,
  mustBePartOfAuthorityToListCaseCompetentThirdPartiesError,
  mustBePartOfAuthorityToListCaseDomainsError,
  mustBePartOfAuthorityToUpdateCaseCompetentThirdPartyError,
  mustBePartOfAuthorityToUpdateCaseDomainError,
  mustBePartOfAuthorityToUpdateCaseError,
  mustBindCaseCompetentThirdPartyWithRightScopeError,
  mustBindCaseDomainWithRightScopeError,
  noBoundCaseToDeleteCaseCompetentThirdPartyError,
  noBoundCaseToDeleteCaseDomainError,
  noBoundChildCaseCompetentThirdPartyToDeleteCaseCompetentThirdPartyError,
  noBoundChildCaseDomainToDeleteCaseDomainError,
} from '@mediature/main/src/models/entities/errors';
import { PhoneTypeSchema } from '@mediature/main/src/models/entities/phone';
import { CreateCaseInboundEmailDataSchema, DeleteCaseInboundEmailDataSchema } from '@mediature/main/src/models/jobs/case';
import { getBossClientInstance } from '@mediature/main/src/server/queueing/client';
import { createCaseInboundEmailTopic } from '@mediature/main/src/server/queueing/workers/create-case-inbound-email';
import { deleteCaseInboundEmailTopic } from '@mediature/main/src/server/queueing/workers/delete-case-inbound-email';
import { isUserAnAdmin } from '@mediature/main/src/server/routers/authority';
import { isUserMainAgentOfAuthority } from '@mediature/main/src/server/routers/common/agent';
import { formatSafeAttachmentsToProcess, uploadPdfFile, uploadXlsxFile } from '@mediature/main/src/server/routers/common/attachment';
import {
  agentPrismaToModel,
  attachmentIdPrismaToModel,
  attachmentPrismaToModel,
  authorityPrismaToModel,
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
import { csvToXlsx } from '@mediature/main/src/utils/excel';
import { formatSearchQuery } from '@mediature/main/src/utils/prisma';
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

export async function assertUserCanManageThisCase(userId: string, caseId: string): Promise<boolean> {
  const targetedCase = await prisma.case.findFirst({
    where: {
      id: caseId,
    },
  });
  if (!targetedCase) {
    throw caseNotFoundError;
  }

  if (!targetedCase.agentId || !(await isAgentThisUser(userId, targetedCase.agentId))) {
    throw mustBeAssignedToThisCaseError;
  }

  return true;
}

export async function assertUserAnAgentPartOfAuthority(authorityId: string, userId: string): Promise<boolean> {
  if (!(await isUserAnAgentPartOfAuthority(authorityId, userId))) {
    throw authorityAgentRoleRequiredError;
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
    throw domainCreationMustBeLowLevelError;
  } else if (!!expectedAuthorityId && parentItem.authorityId !== null && expectedAuthorityId !== parentItem.authorityId) {
    throw domainMustBeScopedCorrectlyError;
  } else if (!expectedAuthorityId && parentItem.authorityId !== null) {
    throw globalDomainMustBeScopedCorrectlyError;
  }
}

export async function assertCaseCompetentThirdPartyParentItemIsAllowed(parentItemId: string, expectedAuthorityId?: string): Promise<void> {
  const parentItem = await prisma.caseCompetentThirdPartyItem.findUniqueOrThrow({
    where: {
      id: parentItemId,
    },
  });

  if (!!parentItem.parentItemId) {
    throw competentThirdPartyCreationMustBeLowLevelError;
  } else if (!!expectedAuthorityId && parentItem.authorityId !== null && expectedAuthorityId !== parentItem.authorityId) {
    throw competentThirdPartyMustBeScopedCorrectlyError;
  } else if (!expectedAuthorityId && parentItem.authorityId !== null) {
    throw globalCompetentThirdPartyMustBeScopedCorrectlyError;
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
        initiatedBy: null,
        status: CaseStatusSchema.Values.TO_PROCESS,
        closedAt: null,
        faceToFaceMediation: false,
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
            genderIdentity: input.genderIdentity,
            representation: null,
            address: input.address
              ? {
                  create: {
                    street: input.address.street,
                    city: input.address.city,
                    postalCode: input.address.postalCode,
                    countryCode: input.address.countryCode,
                    subdivision: input.address.subdivision,
                  },
                }
              : undefined,
            phone: input.phone
              ? {
                  create: {
                    phoneType: input.phone.phoneType,
                    callingCode: input.phone.callingCode,
                    countryCode: input.phone.countryCode,
                    number: input.phone.number,
                  },
                }
              : undefined,
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

    const bossClient = await getBossClientInstance();
    await bossClient.send(
      createCaseInboundEmailTopic,
      CreateCaseInboundEmailDataSchema.parse({
        caseId: newCase.id,
      }),
      {
        retryLimit: 50,
        retryBackoff: true,
      }
    );

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
      throw caseNotFoundError;
    }

    if (!(await isUserAnAgentPartOfAuthority(targetedCase.authorityId, ctx.user.id))) {
      throw mustBePartOfAuthorityToUpdateCaseError;
    }

    if (!!input.domainId) {
      const domain = await prisma.caseDomainItem.findUnique({
        where: {
          id: input.domainId,
        },
      });

      if (!domain) {
        throw domainToBindNotFoundError;
      } else if (domain.authorityId !== null && domain.authorityId !== targetedCase.authorityId) {
        throw mustBindCaseDomainWithRightScopeError;
      }
    }

    if (!!input.competentThirdPartyId) {
      const competentThirdParty = await prisma.caseCompetentThirdPartyItem.findUnique({
        where: {
          id: input.competentThirdPartyId,
        },
      });

      if (!competentThirdParty) {
        throw competentThirdPartyToBindNotFoundError;
      } else if (competentThirdParty.authorityId !== null && competentThirdParty.authorityId !== targetedCase.authorityId) {
        throw mustBindCaseCompetentThirdPartyWithRightScopeError;
      }
    }

    let status: CaseStatus = input.status;
    let closedAt: Date | null = null;
    let statusSwitchedToClose = false;
    if (input.close) {
      // When closing or if closed it requires having the status in its final state (no matter the status input)
      status = CaseStatus.CLOSED;

      if (targetedCase.closedAt) {
        closedAt = targetedCase.closedAt;
      } else {
        closedAt = new Date();
        statusSwitchedToClose = true;
      }
    } else {
      // If reopening or it remains open, we sure it does not stay in the final state
      if (targetedCase.status === CaseStatus.CLOSED) {
        status = CaseStatusSchema.Values.ABOUT_TO_CLOSE;
      }
    }

    // No `deleteIfExists` so doing the following chaining "read + write" (if no longer expected, delete) (ref: https://github.com/prisma/prisma/issues/9460)
    const deleteCitizenAddress: boolean = !!targetedCase.citizen.addressId && !input.address;
    const deleteCitizenPhone: boolean = !!targetedCase.citizen.phoneId && !input.phone;

    const updatedCase = await prisma.case.update({
      where: {
        id: input.caseId,
      },
      data: {
        initiatedFrom: input.initiatedFrom,
        initiatedBy: input.initiatedBy,
        alreadyRequestedInThePast: input.alreadyRequestedInThePast,
        gotAnswerFromPreviousRequest: input.gotAnswerFromPreviousRequest,
        description: input.description,
        units: input.units,
        termReminderAt: input.termReminderAt,
        status: status,
        closedAt: closedAt,
        faceToFaceMediation: input.faceToFaceMediation,
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
            email: input.email,
            firstname: input.firstname,
            lastname: input.lastname,
            genderIdentity: input.genderIdentity,
            representation: input.representation,
            address: {
              delete: deleteCitizenAddress,
              upsert: input.address
                ? {
                    create: {
                      street: input.address.street,
                      city: input.address.city,
                      postalCode: input.address.postalCode,
                      countryCode: input.address.countryCode,
                      subdivision: input.address.subdivision,
                    },
                    update: {
                      street: input.address.street,
                      city: input.address.city,
                      postalCode: input.address.postalCode,
                      countryCode: input.address.countryCode,
                      subdivision: input.address.subdivision,
                    },
                  }
                : undefined,
            },
            phone: {
              delete: deleteCitizenPhone,
              upsert: input.phone
                ? {
                    create: {
                      phoneType: input.phone.phoneType,
                      callingCode: input.phone.callingCode,
                      countryCode: input.phone.countryCode,
                      number: input.phone.number,
                    },
                    update: {
                      phoneType: input.phone.phoneType,
                      callingCode: input.phone.callingCode,
                      countryCode: input.phone.countryCode,
                      number: input.phone.number,
                    },
                  }
                : undefined,
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
        unprocessedMessages: null,
        similarCases: null,
      }),
    };
  }),
  deleteCase: privateProcedure.input(DeleteCaseSchema).mutation(async ({ ctx, input }) => {
    await assertUserCanManageThisCase(ctx.user.id, input.caseId);

    // It will delete all relations thanks to the `onDelete` hook
    // except for attachments that would require complex manual steps (since they can be linked to multiple entities)
    //
    // We let a cron job to properly unused attachments after some time
    const deletedCase = await prisma.case.delete({
      where: {
        id: input.caseId,
      },
    });

    // Delete the virtual email address so people sending emails to it would receive a normal error from the provider
    // (without it, it would silently end nowhere since no existing case while passing the inbound endpoint)
    const bossClient = await getBossClientInstance();
    await bossClient.send(
      deleteCaseInboundEmailTopic,
      DeleteCaseInboundEmailDataSchema.parse({
        caseId: deletedCase.id,
        caseHumanId: deletedCase.humanId,
      }),
      {
        retryLimit: 50,
        retryBackoff: true,
      }
    );

    return;
  }),
  assignCase: privateProcedure.input(AssignCaseSchema).mutation(async ({ ctx, input }) => {
    const targetedCase = await prisma.case.findFirst({
      where: {
        id: input.caseId,
      },
      include: {
        agent: {
          include: {
            user: true,
          },
        },
      },
    });
    if (!targetedCase) {
      throw caseNotFoundError;
    }

    const originatorUser = await prisma.user.findUniqueOrThrow({
      where: {
        id: ctx.user.id,
      },
    });

    let agentIdToAssign: string | null = null;
    if (input.myself) {
      if (targetedCase.agentId) {
        throw cannotAssignYourselfIfAlreadyAssignedError;
      }

      const userAgent = await prisma.agent.findFirstOrThrow({
        where: {
          userId: ctx.user.id,
          authorityId: targetedCase.authorityId,
        },
        include: {
          user: true,
        },
      });

      agentIdToAssign = userAgent.id;
    } else {
      const isMainAgent = await isUserMainAgentOfAuthority(targetedCase.authorityId, ctx.user.id);

      if (input.agentId) {
        if (!isMainAgent) {
          throw authorityMainAgentRoleRequiredError;
        }

        if (!(await isAgentPartOfAuthority(targetedCase.authorityId, input.agentId))) {
          throw cannotAssignAgentFromAnotherAuthorityError;
        }

        agentIdToAssign = input.agentId;
      } else if (!isMainAgent && targetedCase.agent?.userId !== ctx.user.id) {
        assignedToCaseOrAuthorityMainAgentRoleRequiredError;
      }
    }

    // Notify previous agent of being unassigned
    if (targetedCase.agent && targetedCase.agent?.userId !== ctx.user.id) {
      await mailer.sendCaseUnassignedBySomeone({
        recipient: targetedCase.agent.user.email,
        firstname: targetedCase.agent.user.firstname,
        originatorFirstname: originatorUser.firstname,
        originatorLastname: originatorUser.lastname,
        caseUrl: linkRegistry.get('case', { authorityId: targetedCase.authorityId, caseId: targetedCase.id }, { absolute: true }),
        caseHumanId: targetedCase.humanId.toString(),
      });
    }

    // Notify the new agent
    if (!!agentIdToAssign && !input.myself) {
      const agentToAssign = await prisma.agent.findUniqueOrThrow({
        where: {
          id: agentIdToAssign,
        },
        include: {
          user: true,
        },
      });

      await mailer.sendCaseAssignedBySomeone({
        recipient: agentToAssign.user.email,
        firstname: agentToAssign.user.firstname,
        originatorFirstname: originatorUser.firstname,
        originatorLastname: originatorUser.lastname,
        caseUrl: linkRegistry.get('case', { authorityId: targetedCase.authorityId, caseId: targetedCase.id }, { absolute: true }),
        caseHumanId: targetedCase.humanId.toString(),
      });
    }

    // This endpoint works for assignation and unassignment
    const updatedCase = await prisma.case.update({
      where: {
        id: input.caseId,
      },
      data: {
        agent: {
          connect: !!agentIdToAssign
            ? {
                id: agentIdToAssign,
              }
            : undefined,
          disconnect: !agentIdToAssign ? true : undefined,
        },
      },
    });

    return { case: casePrismaToModel(updatedCase) };
  }),
  getCaseDomainItems: privateProcedure.input(GetCaseDomainItemsSchema).query(async ({ ctx, input }) => {
    if (!!input.authorityId && !(await isUserAnAgentPartOfAuthority(input.authorityId, ctx.user.id))) {
      throw mustBePartOfAuthorityToListCaseDomainsError;
    } else if (!input.authorityId && !(await isUserAnAdmin(ctx.user.id))) {
      throw adminRoleRequiredError;
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
    if (!!input.authorityId && !(await isUserMainAgentOfAuthority(input.authorityId, ctx.user.id))) {
      throw mustBePartOfAuthorityToCreateCaseDomainError;
    } else if (!input.authorityId && !(await isUserAnAdmin(ctx.user.id))) {
      throw adminRoleRequiredError;
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
      throw domainNotFoundError;
    } else if (!item.authorityId && !(await isUserAnAdmin(ctx.user.id))) {
      throw adminRoleRequiredError;
    } else if (!!item.authorityId && !(await isUserMainAgentOfAuthority(item.authorityId, ctx.user.id))) {
      throw mustBePartOfAuthorityToUpdateCaseDomainError;
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
      throw domainNotFoundError;
    } else if (!!item.authorityId && !(await isUserMainAgentOfAuthority(item.authorityId, ctx.user.id))) {
      throw mustBePartOfAuthorityToDeleteCaseDomainError;
    } else if (!item.authorityId && !(await isUserAnAdmin(ctx.user.id))) {
      throw adminRoleRequiredError;
    } else if (item._count.Case > 0) {
      throw noBoundCaseToDeleteCaseDomainError;
    } else if (item._count.childrenItems > 0) {
      throw noBoundChildCaseDomainToDeleteCaseDomainError;
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
      throw mustBePartOfAuthorityToListCaseCompetentThirdPartiesError;
    } else if (!input.authorityId && !(await isUserAnAdmin(ctx.user.id))) {
      throw adminRoleRequiredError;
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
    if (!!input.authorityId && !(await isUserMainAgentOfAuthority(input.authorityId, ctx.user.id))) {
      throw mustBePartOfAuthorityToCreateCaseCompetentThirdPartyError;
    } else if (!input.authorityId && !(await isUserAnAdmin(ctx.user.id))) {
      throw adminRoleRequiredError;
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
      throw competentThirdPartyNotFoundError;
    } else if (!item.authorityId && !(await isUserAnAdmin(ctx.user.id))) {
      throw adminRoleRequiredError;
    } else if (!!item.authorityId && !(await isUserMainAgentOfAuthority(item.authorityId, ctx.user.id))) {
      throw mustBePartOfAuthorityToUpdateCaseCompetentThirdPartyError;
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
      throw competentThirdPartyNotFoundError;
    } else if (!!item.authorityId && !(await isUserMainAgentOfAuthority(item.authorityId, ctx.user.id))) {
      throw mustBePartOfAuthorityToDeleteCaseCompetentThirdPartyError;
    } else if (!item.authorityId && !(await isUserAnAdmin(ctx.user.id))) {
      throw adminRoleRequiredError;
    } else if (item._count.Case > 0) {
      throw noBoundCaseToDeleteCaseCompetentThirdPartyError;
    } else if (item._count.childrenItems > 0) {
      throw noBoundChildCaseCompetentThirdPartyToDeleteCaseCompetentThirdPartyError;
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
        competentThirdParty: {
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
      throw caseNotFoundError;
    } else if (!(await isUserAnAgentPartOfAuthority(targetedCase.authorityId, ctx.user.id))) {
      throw agentCanOnlyAccessItsAuthorityCasesError;
    }

    const unprocessedMessagesCount = await prisma.messagesOnCases.count({
      where: {
        caseId: targetedCase.id,
        markedAsProcessed: false,
      },
    });

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
        unprocessedMessages: unprocessedMessagesCount,
        similarCases: null,
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
        throw agentCanOnlySeeAuthorityCasesError;
      }
    }

    let humandIdSearch: number | undefined;
    let formattedSearchQuery: string | undefined;
    if (input.filterBy.query) {
      formattedSearchQuery = formatSearchQuery(input.filterBy.query);
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
                      search: formattedSearchQuery,
                      mode: 'insensitive',
                    },
                  },
                  {
                    citizen: {
                      firstname: {
                        search: formattedSearchQuery,
                        mode: 'insensitive',
                      },
                    },
                  },
                  {
                    citizen: {
                      lastname: {
                        search: formattedSearchQuery,
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
        competentThirdParty: {
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

    const unprocessedMessagesCountObjects = await prisma.messagesOnCases.groupBy({
      by: ['caseId'],
      where: {
        markedAsProcessed: false,
        case: {
          id: {
            in: cases.map((iCase) => iCase.id),
          },
        },
      },
      _count: {
        _all: true,
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

          const unprocessedMessagesCountObject = unprocessedMessagesCountObjects.find((countObject) => countObject.caseId === iterationCase.id);

          // It's a bit resource expensive but I did not find an easier way
          let similarCases: CaseSchemaType[] | null = null;
          if (input.include?.similarCases === true) {
            const prismaSimilarCases = await prisma.case.findMany({
              where: {
                id: {
                  not: iterationCase.id,
                },
                authorityId: iterationCase.authorityId,
                citizen: {
                  firstname: {
                    search: formatSearchQuery(iterationCase.citizen.firstname),
                    mode: 'insensitive',
                  },
                  lastname: {
                    search: formatSearchQuery(iterationCase.citizen.lastname),
                    mode: 'insensitive',
                  },
                },
              },
              orderBy: {
                createdAt: 'desc',
              },
            });

            similarCases = prismaSimilarCases.map((sc) => casePrismaToModel(sc));
          }

          return {
            case: casePrismaToModel(iterationCase),
            citizen: citizenPrismaToModel(iterationCase.citizen),
            agent: iterationCase.agent ? agentPrismaToModel(iterationCase.agent) : null,
            notes: null,
            attachments: attachments,
            unprocessedMessages: unprocessedMessagesCountObject ? unprocessedMessagesCountObject._count._all : 0,
            similarCases: similarCases,
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
        authority: true,
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

    if (!targetedCase) {
      throw caseNotFoundError;
    } else if (!(await isUserAnAgentPartOfAuthority(targetedCase.authorityId, ctx.user.id))) {
      throw agentCanOnlyAccessItsAuthorityCasesError;
    }

    const fileStream = await renderToStream(
      CaseSynthesisDocument({
        case: casePrismaToModel(targetedCase),
        authority: await authorityPrismaToModel(targetedCase.authority),
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
      throw authorityAgentRoleRequiredError;
    } else if (!input.authorityId && !(await isUserAnAdmin(ctx.user.id))) {
      throw adminRoleRequiredError;
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

    // Despite CSV working well for most of software (delimiter and UTF8) we faced our agents
    // having merged columns or encoding issues with Excel versions. Since they have this tool most of the time
    // we decided to provide a .xlsx instead of a .csv
    const xlsxBuffer = await csvToXlsx(csvString);

    const fileId = await uploadXlsxFile({
      filename: `${filenameBase}.xlsx`,
      kind: attachmentKindList[AttachmentKindSchema.Values.CASES_ANALYTICS],
      file: xlsxBuffer,
    });

    const attachmentUi = await attachmentIdPrismaToModel(fileId);

    return {
      attachment: attachmentUi,
    };
  }),
  addNoteToCase: privateProcedure.input(AddNoteToCaseSchema).mutation(async ({ ctx, input }) => {
    const targetedCase = await prisma.case.findUnique({
      where: {
        id: input.caseId,
      },
    });
    if (!targetedCase) {
      throw caseNotFoundError;
    }

    await assertUserAnAgentPartOfAuthority(targetedCase.authorityId, ctx.user.id);

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
          some: {
            id: {
              equals: input.noteId,
            },
          },
        },
      },
    });
    if (!targetedCase) {
      throw caseNotFoundError;
    }

    await assertUserAnAgentPartOfAuthority(targetedCase.authorityId, ctx.user.id);

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
          some: {
            id: {
              equals: input.noteId,
            },
          },
        },
      },
    });
    if (!targetedCase) {
      throw caseNotFoundError;
    }

    await assertUserAnAgentPartOfAuthority(targetedCase.authorityId, ctx.user.id);

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
    const targetedCase = await prisma.case.findUnique({
      where: {
        id: input.caseId,
      },
    });
    if (!targetedCase) {
      throw caseNotFoundError;
    }

    await assertUserAnAgentPartOfAuthority(targetedCase.authorityId, ctx.user.id);

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

    const updatedCase = await prisma.case.update({
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
    await assertUserCanManageThisCase(ctx.user.id, input.caseId);

    const attachmentOnCase = await prisma.attachmentsOnCases.findUnique({
      where: {
        caseId_attachmentId: {
          caseId: input.caseId,
          attachmentId: input.attachmentId,
        },
      },
    });
    if (!attachmentOnCase) {
      throw documentNotFoundError;
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
          some: {
            attachmentId: {
              equals: input.attachmentId,
            },
          },
        },
      },
    });
    if (!targetedCase) {
      throw caseNotFoundError;
    }

    await assertUserAnAgentPartOfAuthority(targetedCase.authorityId, ctx.user.id);

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
