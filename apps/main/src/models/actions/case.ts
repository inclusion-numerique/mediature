import z from 'zod';

import { GetterInputSchema } from '@mediature/main/src/models/actions/common';
import { AddressInputSchema } from '@mediature/main/src/models/entities/address';
import { AgentSchema } from '@mediature/main/src/models/entities/agent';
import { AttachmentInputSchema, AttachmentSchema } from '@mediature/main/src/models/entities/attachment';
import { AuthoritySchema } from '@mediature/main/src/models/entities/authority';
import {
  CaseAttachmentTypeSchema,
  CaseCompetentThirdPartyItemSchema,
  CaseDomainItemSchema,
  CaseNoteSchema,
  incompleteCaseSchema,
} from '@mediature/main/src/models/entities/case';
import { CitizenSchema } from '@mediature/main/src/models/entities/citizen';
import { PhoneInputSchema } from '@mediature/main/src/models/entities/phone';

export const requestCaseAttachmentsMax = 10;
export const incompleteRequestCaseSchema = z
  .object({
    authorityId: incompleteCaseSchema.shape.authorityId,
    email: CitizenSchema.shape.email,
    firstname: CitizenSchema.shape.firstname,
    lastname: CitizenSchema.shape.lastname,
    address: AddressInputSchema,
    phone: PhoneInputSchema,
    alreadyRequestedInThePast: incompleteCaseSchema.shape.alreadyRequestedInThePast,
    gotAnswerFromPreviousRequest: incompleteCaseSchema.shape.gotAnswerFromPreviousRequest,
    description: incompleteCaseSchema.shape.description,
    emailCopyWanted: incompleteCaseSchema.shape.emailCopyWanted,
    attachments: z.array(AttachmentInputSchema).max(requestCaseAttachmentsMax),
  })
  .strict();
export const RequestCaseSchema = incompleteRequestCaseSchema.superRefine((data, ctx) => {
  if (data) {
    if (data.alreadyRequestedInThePast === false && data.gotAnswerFromPreviousRequest !== null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `vous ne pouvez pas préciser avoir eu une réponse de l'administration si vous indiquez ne pas avoir fait une requête auparavant.`,
      });
    }
  }
});
export type RequestCaseSchemaType = z.infer<typeof RequestCaseSchema>;

export const RequestCasePrefillSchema = incompleteRequestCaseSchema.deepPartial();
export type RequestCasePrefillSchemaType = z.infer<typeof RequestCasePrefillSchema>;

export const updateCaseAttachmentsMax = 100;
export const incompleteUpdateCaseSchema = z
  .object({
    initiatedFrom: incompleteCaseSchema.shape.initiatedFrom,
    caseId: incompleteCaseSchema.shape.id,
    address: AddressInputSchema,
    phone: PhoneInputSchema,
    description: incompleteCaseSchema.shape.description,
    domainId: z.string().uuid().nullable(),
    competent: incompleteCaseSchema.shape.competent,
    competentThirdPartyId: z.string().uuid().nullable(),
    units: incompleteCaseSchema.shape.units,
    termReminderAt: incompleteCaseSchema.shape.termReminderAt,
    status: incompleteCaseSchema.shape.status,
    close: z.boolean(),
    finalConclusion: incompleteCaseSchema.shape.finalConclusion,
    nextRequirements: incompleteCaseSchema.shape.nextRequirements,
  })
  .strict();
export const UpdateCaseSchema = incompleteUpdateCaseSchema.superRefine((data, ctx) => {
  if (data) {
    if (data.competent === true && data.competentThirdPartyId !== null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `vous ne pouvez pas préciser une entité tierce compétente sans avoir marqué ne pas être compétent pour traiter le dossier`,
      });
    }
  }
});
export type UpdateCaseSchemaType = z.infer<typeof UpdateCaseSchema>;

export const UpdateCasePrefillSchema = incompleteUpdateCaseSchema.deepPartial();
export type UpdateCasePrefillSchemaType = z.infer<typeof UpdateCasePrefillSchema>;

export const AssignCaseSchema = z
  .object({
    caseId: incompleteCaseSchema.shape.id,
    agentId: AgentSchema.shape.id.nullish(),
    myself: z.boolean().nullish(),
  })
  .strict();
export type AssignCaseSchemaType = z.infer<typeof AssignCaseSchema>;

export const AssignCasePrefillSchema = AssignCaseSchema.deepPartial();
export type AssignCasePrefillSchemaType = z.infer<typeof AssignCasePrefillSchema>;

export const UnassignCaseSchema = z
  .object({
    caseId: incompleteCaseSchema.shape.id,
    agentId: AgentSchema.shape.id,
  })
  .strict();
export type UnassignCaseSchemaType = z.infer<typeof UnassignCaseSchema>;

export const UnassignCasePrefillSchema = UnassignCaseSchema.deepPartial();
export type UnassignCasePrefillSchemaType = z.infer<typeof UnassignCasePrefillSchema>;

export const GetCaseSchema = z
  .object({
    id: incompleteCaseSchema.shape.id,
  })
  .strict();
export type GetCaseSchemaType = z.infer<typeof GetCaseSchema>;

export const GetCaseDomainItemsSchema = z
  .object({
    authorityId: AuthoritySchema.shape.id.nullable(),
  })
  .strict();
export type GetCaseDomainItemsSchemaType = z.infer<typeof GetCaseDomainItemsSchema>;

export const CreateCaseDomainItemSchema = z
  .object({
    authorityId: AuthoritySchema.shape.id.nullish(),
    parentId: CaseDomainItemSchema.shape.id.nullish(),
    name: CaseDomainItemSchema.shape.name,
  })
  .strict();
export type CreateCaseDomainItemSchemaType = z.infer<typeof CreateCaseDomainItemSchema>;

export const CreateCaseDomainItemPrefillSchema = CreateCaseDomainItemSchema.deepPartial();
export type CreateCaseDomainItemPrefillSchemaType = z.infer<typeof CreateCaseDomainItemPrefillSchema>;

export const EditCaseDomainItemSchema = z
  .object({
    itemId: CaseDomainItemSchema.shape.id,
    parentId: CaseDomainItemSchema.shape.id.nullish(),
    name: CaseDomainItemSchema.shape.name,
  })
  .strict();
export type EditCaseDomainItemSchemaType = z.infer<typeof EditCaseDomainItemSchema>;

export const EditCaseDomainItemPrefillSchema = EditCaseDomainItemSchema.deepPartial();
export type EditCaseDomainItemPrefillSchemaType = z.infer<typeof EditCaseDomainItemPrefillSchema>;

export const DeleteCaseDomainItemSchema = z
  .object({
    itemId: CaseDomainItemSchema.shape.id,
    authorityId: AuthoritySchema.shape.id.nullish(),
  })
  .strict();
export type DeleteCaseDomainItemSchemaType = z.infer<typeof DeleteCaseDomainItemSchema>;

export const DeleteCaseDomainItemPrefillSchema = DeleteCaseDomainItemSchema.deepPartial();
export type DeleteCaseDomainItemPrefillSchemaType = z.infer<typeof DeleteCaseDomainItemPrefillSchema>;

export const GetCaseCompetentThirdPartyItemsSchema = z
  .object({
    authorityId: AuthoritySchema.shape.id.nullable(),
  })
  .strict();
export type GetCaseCompetentThirdPartyItemsSchemaType = z.infer<typeof GetCaseCompetentThirdPartyItemsSchema>;

export const CreateCaseCompetentThirdPartyItemSchema = z
  .object({
    authorityId: AuthoritySchema.shape.id.nullish(),
    parentId: CaseCompetentThirdPartyItemSchema.shape.id.nullish(),
    name: CaseCompetentThirdPartyItemSchema.shape.name,
  })
  .strict();
export type CreateCaseCompetentThirdPartyItemSchemaType = z.infer<typeof CreateCaseCompetentThirdPartyItemSchema>;

export const CreateCaseCompetentThirdPartyItemPrefillSchema = CreateCaseCompetentThirdPartyItemSchema.deepPartial();
export type CreateCaseCompetentThirdPartyItemPrefillSchemaType = z.infer<typeof CreateCaseCompetentThirdPartyItemPrefillSchema>;

export const EditCaseCompetentThirdPartyItemSchema = z
  .object({
    itemId: CaseCompetentThirdPartyItemSchema.shape.id,
    parentId: CaseCompetentThirdPartyItemSchema.shape.id.nullish(),
    name: CaseCompetentThirdPartyItemSchema.shape.name,
  })
  .strict();
export type EditCaseCompetentThirdPartyItemSchemaType = z.infer<typeof EditCaseCompetentThirdPartyItemSchema>;

export const EditCaseCompetentThirdPartyItemPrefillSchema = EditCaseCompetentThirdPartyItemSchema.deepPartial();
export type EditCaseCompetentThirdPartyItemPrefillSchemaType = z.infer<typeof EditCaseCompetentThirdPartyItemPrefillSchema>;

export const DeleteCaseCompetentThirdPartyItemSchema = z
  .object({
    itemId: CaseCompetentThirdPartyItemSchema.shape.id,
    authorityId: AuthoritySchema.shape.id.nullish(),
  })
  .strict();
export type DeleteCaseCompetentThirdPartyItemSchemaType = z.infer<typeof DeleteCaseCompetentThirdPartyItemSchema>;

export const DeleteCaseCompetentThirdPartyItemPrefillSchema = DeleteCaseCompetentThirdPartyItemSchema.deepPartial();
export type DeleteCaseCompetentThirdPartyItemPrefillSchemaType = z.infer<typeof DeleteCaseCompetentThirdPartyItemPrefillSchema>;

export const ListCasesSchema = GetterInputSchema.extend({
  filterBy: z.object({
    query: z.string().nullish(),
    authorityIds: z.array(AuthoritySchema.shape.id).nullish(),
    agentIds: z.array(AgentSchema.shape.id).nullish(),
    assigned: z.boolean().nullish(),
    mine: z.boolean().nullish(),
  }),
}).strict();
export type ListCasesSchemaType = z.infer<typeof ListCasesSchema>;

export const ListCasesPrefillSchema = ListCasesSchema.deepPartial();
export type ListCasesPrefillSchemaType = z.infer<typeof ListCasesPrefillSchema>;

export const GeneratePdfFromCaseSchema = z
  .object({
    caseId: incompleteCaseSchema.shape.id,
  })
  .strict();
export type GeneratePdfFromCaseSchemaType = z.infer<typeof GeneratePdfFromCaseSchema>;

export const GeneratePdfFromCasePrefillSchema = GeneratePdfFromCaseSchema.deepPartial();
export type GeneratePdfFromCasePrefillSchemaType = z.infer<typeof GeneratePdfFromCasePrefillSchema>;

export const GenerateCsvFromCaseAnalyticsSchema = z
  .object({
    authorityId: AuthoritySchema.shape.id.nullish(),
  })
  .strict();
export type GenerateCsvFromCaseAnalyticsSchemaType = z.infer<typeof GenerateCsvFromCaseAnalyticsSchema>;

export const GenerateCsvFromCaseAnalyticsPrefillSchema = GenerateCsvFromCaseAnalyticsSchema.deepPartial();
export type GenerateCsvFromCaseAnalyticsPrefillSchemaType = z.infer<typeof GenerateCsvFromCaseAnalyticsPrefillSchema>;

export const AddNoteToCaseSchema = z
  .object({
    caseId: incompleteCaseSchema.shape.id,
    date: CaseNoteSchema.shape.date,
    content: CaseNoteSchema.shape.content,
  })
  .strict();
export type AddNoteToCaseSchemaType = z.infer<typeof AddNoteToCaseSchema>;

export const AddNoteToCasePrefillSchema = AddNoteToCaseSchema.deepPartial();
export type AddNoteToCasePrefillSchemaType = z.infer<typeof AddNoteToCasePrefillSchema>;

export const RemoveNoteFromCaseSchema = z
  .object({
    noteId: CaseNoteSchema.shape.id,
  })
  .strict();
export type RemoveNoteFromCaseSchemaType = z.infer<typeof RemoveNoteFromCaseSchema>;

export const RemoveNoteFromCasePrefillSchema = RemoveNoteFromCaseSchema.deepPartial();
export type RemoveNoteFromCasePrefillSchemaType = z.infer<typeof RemoveNoteFromCasePrefillSchema>;

export const UpdateCaseNoteSchema = z
  .object({
    noteId: CaseNoteSchema.shape.id,
    date: CaseNoteSchema.shape.date,
    content: CaseNoteSchema.shape.content,
  })
  .strict();
export type UpdateCaseNoteSchemaType = z.infer<typeof UpdateCaseNoteSchema>;

export const UpdateCaseNotePrefillSchema = UpdateCaseNoteSchema.deepPartial();
export type UpdateCaseNotePrefillSchemaType = z.infer<typeof UpdateCaseNotePrefillSchema>;

export const AddAttachmentToCaseSchema = z
  .object({
    caseId: incompleteCaseSchema.shape.id,
    attachmentId: AttachmentInputSchema,
    transmitter: CaseAttachmentTypeSchema,
  })
  .strict();
export type AddAttachmentToCaseSchemaType = z.infer<typeof AddAttachmentToCaseSchema>;

export const AddAttachmentToCasePrefillSchema = AddAttachmentToCaseSchema.deepPartial();
export type AddAttachmentToCasePrefillSchemaType = z.infer<typeof AddAttachmentToCasePrefillSchema>;

export const RemoveAttachmentFromCaseSchema = z
  .object({
    caseId: incompleteCaseSchema.shape.id,
    attachmentId: AttachmentInputSchema,
  })
  .strict();
export type RemoveAttachmentFromCaseSchemaType = z.infer<typeof RemoveAttachmentFromCaseSchema>;

export const RemoveAttachmentFromCasePrefillSchema = RemoveAttachmentFromCaseSchema.deepPartial();
export type RemoveAttachmentFromCasePrefillSchemaType = z.infer<typeof RemoveAttachmentFromCasePrefillSchema>;

export const UpdateCaseAttachmentLabelSchema = z
  .object({
    attachmentId: AttachmentSchema.shape.id,
    transmitter: CaseAttachmentTypeSchema,
  })
  .strict();
export type UpdateCaseAttachmentLabelSchemaType = z.infer<typeof UpdateCaseAttachmentLabelSchema>;

export const UpdateCaseAttachmentLabelPrefillSchema = UpdateCaseAttachmentLabelSchema.deepPartial();
export type UpdateCaseAttachmentLabelPrefillSchemaType = z.infer<typeof UpdateCaseAttachmentLabelPrefillSchema>;
