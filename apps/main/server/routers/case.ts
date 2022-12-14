import {
  AddAttachmentToCaseSchema,
  AddNoteToCaseSchema,
  AssignCaseSchema,
  GeneratePdfFromCaseSchema,
  ListCasesSchema,
  RemoveAttachmentFromCaseSchema,
  RemoveNoteFromCaseSchema,
  RequestCaseSchema,
  UnassignCaseSchema,
  UpdateCaseAttachmentLabelSchema,
  UpdateCaseNoteSchema,
  UpdateCaseSchema,
} from '@mediature/main/models/actions/case';
import { CasePlatformSchema, CaseStatusSchema } from '@mediature/main/models/entities/case';
import { PhoneTypeSchema } from '@mediature/main/models/entities/phone';
import { prisma } from '@mediature/main/prisma/client';
import { isUserAnAdmin } from '@mediature/main/server/routers/authority';
import { privateProcedure, publicProcedure, router } from '@mediature/main/server/trpc';

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
    throw new Error(`vous pouvez ajouter une note seulement si vous êtes assigné au dossier`);
  }

  return true;
}

export const caseRouter = router({
  requestCase: publicProcedure.input(RequestCaseSchema).mutation(async ({ ctx, input }) => {
    const newCase = await prisma.case.create({
      data: {
        alreadyRequestedInThePast: input.alreadyRequestedInThePast,
        gotAnswerFromPreviousRequest: input.gotAnswerFromPreviousRequest,
        description: input.description,
        units: '', // TODO
        emailCopyWanted: input.emailCopyWanted,
        termReminderAt: null,
        initiatedFrom: CasePlatformSchema.Values.WEB,
        status: CaseStatusSchema.Values.TO_PROCESS,
        closedAt: null,
        finalConclusion: null,
        nextRequirements: null,
        citizen: {
          // TODO: get real address/phone from the form
          create: {
            email: input.email,
            firstname: input.firstname,
            lastname: input.lastname,
            address: {
              create: {
                street: '',
                city: '',
                postalCode: '',
                countryCode: '',
                subdivision: '',
              },
            },
            phone: {
              create: {
                phoneType: PhoneTypeSchema.Values.UNSPECIFIED,
                callingCode: '',
                countryCode: '',
                number: '',
              },
            },
          },
        },
        authority: {
          connect: {
            id: input.authorityId,
          },
        },
      },
    });

    // TODO: since public should return almost nothing? or nothing at all

    return { case: newCase };
  }),
  updateCase: privateProcedure.input(UpdateCaseSchema).mutation(async ({ ctx, input }) => {
    const targetedCase = await prisma.case.findUnique({
      where: {
        id: input.caseId,
      },
    });

    if (!targetedCase) {
      throw new Error(`ce dossier n'existe pas`);
    }

    if (!(await isUserAnAgentPartOfAuthority(targetedCase.authorityId, ctx.user.id))) {
      throw new Error(`vous devez faire partie de la collectivité de ce dossier pour le mettre à jour`);
    }

    let closedAt: Date | null = null;
    if (input.close) {
      if (targetedCase.closedAt) {
        closedAt = targetedCase.closedAt;
      } else {
        closedAt = new Date();
      }
    }

    const updatedCase = await prisma.case.update({
      where: {
        id: input.caseId,
      },
      data: {
        units: input.units,
        termReminderAt: input.termReminderAt,
        status: input.status,
        closedAt: closedAt,
        finalConclusion: input.finalConclusion,
        nextRequirements: input.nextRequirements,
      },
    });

    return { case: updatedCase };
  }),
  assignCase: privateProcedure.input(AssignCaseSchema).mutation(async ({ ctx, input }) => {
    // TODO: maybe better to use userId instead of agentId?
    const agentIdToAssign = input.agentIds[0];

    const targetedCase = await prisma.case.findFirst({
      where: {
        id: input.caseId,
      },
    });
    if (!targetedCase) {
      throw new Error(`ce dossier n'existe pas`);
    }

    if (targetedCase.agentId) {
      throw new Error(`un agent est déjà assigné sur ce dossier, il doit d'abord s'enlever pour que assigner une autre personne`);
    }

    if (!(await isAgentPartOfAuthority(targetedCase.authorityId, agentIdToAssign))) {
      throw new Error(`impossible d'assigner un agent qui ne fait pas partie de la collectivité du dossier`);
    }

    if (!(await isAgentThisUser(ctx.user.id, agentIdToAssign))) {
      throw new Error(`vous ne pouvez assigner que vous-même à un dossier`);
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

    return { case: assignedCase };
  }),
  unassignCase: privateProcedure.input(UnassignCaseSchema).mutation(async ({ ctx, input }) => {
    // TODO: maybe better to use userId instead of agentId?
    const agentIdToUnassign = input.agentIds[0];

    const targetedCase = await prisma.case.findFirst({
      where: {
        id: input.caseId,
      },
    });
    if (!targetedCase) {
      throw new Error(`ce dossier n'existe pas`);
    }

    if (!targetedCase.agentId) {
      throw new Error(`aucun agent n'est assigné sur ce dossier`);
    }

    if (!(await isAgentThisUser(ctx.user.id, agentIdToUnassign))) {
      throw new Error(`vous ne pouvez désassigner que vous-même d'un dossier`);
    }

    const assignedCase = await prisma.case.update({
      where: {
        id: input.caseId,
      },
      data: {
        agent: {
          disconnect: true,
        },
      },
    });

    return { case: assignedCase };
  }),
  listCases: privateProcedure.input(ListCasesSchema).query(async ({ ctx, input }) => {
    const isAdmin = await isUserAnAdmin(ctx.user.id);

    if (!isAdmin) {
      if (
        !input.filterBy.authorityIds ||
        input.filterBy.authorityIds.length !== 1 ||
        !(await isUserAnAgentPartOfAuthorities(input.filterBy.authorityIds, ctx.user.id))
      ) {
        throw new Error(`en tant qu'agent vous ne pouvez que rechercher les dossiers concernant votre collectivité`);
      }
    }

    const cases = await prisma.case.findMany({
      where: {
        authorityId: input.filterBy.authorityIds
          ? {
              in: input.filterBy.authorityIds,
            }
          : undefined,
        agent: {
          is: input.filterBy.assigned === false ? null : undefined,
          isNot: input.filterBy.assigned === false ? null : undefined,
        },
      },
    });

    return { cases };
  }),
  generatePdfFromCase: privateProcedure.input(GeneratePdfFromCaseSchema).mutation(async ({ ctx, input }) => {
    // TODO
    input.caseId;

    return true;
  }),
  addNoteToCase: privateProcedure.input(AddNoteToCaseSchema).mutation(async ({ ctx, input }) => {
    await canUserManageThisCase(ctx.user.id, input.caseId);

    const note = await prisma.case.update({
      where: {
        id: input.caseId,
      },
      data: {
        Note: {
          create: {
            date: input.date,
            content: input.content,
          },
        },
      },
    });

    return { note };
  }),
  removeNoteFromCase: privateProcedure.input(RemoveNoteFromCaseSchema).mutation(async ({ ctx, input }) => {
    const targetedCase = await prisma.case.findFirst({
      where: {
        Note: {
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

    return true;
  }),
  updateCaseNote: privateProcedure.input(UpdateCaseNoteSchema).mutation(async ({ ctx, input }) => {
    const targetedCase = await prisma.case.findFirst({
      where: {
        Note: {
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

    const targetedCase = await prisma.case.update({
      where: {
        id: input.caseId,
      },
      data: {
        AttachmentsOnCases: {
          create: {
            transmitter: input.transmitter,
            attachment: {
              connect: {
                // TODO: for all uploads, pass aId or the unique fileUrl?
                id: input.attachmentId,
              },
            },
          },
        },
      },
    });

    return;
  }),
  removeAttachmentFromCase: privateProcedure.input(RemoveAttachmentFromCaseSchema).mutation(async ({ ctx, input }) => {
    const targetedCase = await prisma.case.findFirst({
      where: {
        AttachmentsOnCases: {
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

    const attachment = await prisma.attachment.delete({
      where: {
        id: input.attachmentId,
      },
    });

    return;
  }),
  updateCaseAttachment: privateProcedure.input(UpdateCaseAttachmentLabelSchema).mutation(async ({ ctx, input }) => {
    const targetedCase = await prisma.case.findFirst({
      where: {
        AttachmentsOnCases: {
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
