import z from 'zod';

import { GetterInputSchema } from '@mediature/main/src/models/actions/common';
import { AddressInputSchema } from '@mediature/main/src/models/entities/address';
import { AgentSchema } from '@mediature/main/src/models/entities/agent';
import { AttachmentSchema } from '@mediature/main/src/models/entities/attachment';
import { AuthoritySchema } from '@mediature/main/src/models/entities/authority';
import { CaseAttachmentTypeSchema, CaseNoteSchema, incompleteCaseSchema } from '@mediature/main/src/models/entities/case';
import { CitizenSchema } from '@mediature/main/src/models/entities/citizen';
import { PhoneInputSchema } from '@mediature/main/src/models/entities/phone';

export const RequestCaseSchema = z
  .object({
    authorityId: incompleteCaseSchema.shape.authorityId,
    email: CitizenSchema.shape.email,
    firstname: CitizenSchema.shape.firstname,
    lastname: CitizenSchema.shape.lastname,
    // address: AddressInputSchema,
    // phone: PhoneInputSchema,
    alreadyRequestedInThePast: incompleteCaseSchema.shape.alreadyRequestedInThePast,
    gotAnswerFromPreviousRequest: incompleteCaseSchema.shape.gotAnswerFromPreviousRequest,
    description: incompleteCaseSchema.shape.description,
    emailCopyWanted: incompleteCaseSchema.shape.emailCopyWanted,
    // TODO: attachements
  })
  .strict();
export type RequestCaseSchemaType = z.infer<typeof RequestCaseSchema>;

export const RequestCasePrefillSchema = RequestCaseSchema.deepPartial();
export type RequestCasePrefillSchemaType = z.infer<typeof RequestCasePrefillSchema>;

export const UpdateCaseSchema = z
  .object({
    initiatedFrom: incompleteCaseSchema.shape.initiatedFrom,
    caseId: incompleteCaseSchema.shape.id,
    description: incompleteCaseSchema.shape.description,
    units: incompleteCaseSchema.shape.units,
    termReminderAt: incompleteCaseSchema.shape.termReminderAt,
    status: incompleteCaseSchema.shape.status,
    close: z.boolean(),
    finalConclusion: incompleteCaseSchema.shape.finalConclusion,
    nextRequirements: incompleteCaseSchema.shape.nextRequirements,
  })
  .strict();
export type UpdateCaseSchemaType = z.infer<typeof UpdateCaseSchema>;

export const UpdateCasePrefillSchema = UpdateCaseSchema.deepPartial();
export type UpdateCasePrefillSchemaType = z.infer<typeof UpdateCasePrefillSchema>;

export const AssignCaseSchema = z
  .object({
    caseId: incompleteCaseSchema.shape.id,
    agentIds: z.array(AgentSchema.shape.id).min(1),
  })
  .strict();
export type AssignCaseSchemaType = z.infer<typeof AssignCaseSchema>;

export const AssignCasePrefillSchema = AssignCaseSchema.deepPartial();
export type AssignCasePrefillSchemaType = z.infer<typeof AssignCasePrefillSchema>;

export const UnassignCaseSchema = z
  .object({
    caseId: incompleteCaseSchema.shape.id,
    agentIds: z.array(AgentSchema.shape.id).min(1),
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

export const ListCasesSchema = GetterInputSchema.extend({
  filterBy: z.object({
    query: z.string().nullish(),
    authorityIds: z.array(AuthoritySchema.shape.id).nullish(),
    assigned: z.boolean().nullish(),
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
    attachmentId: AttachmentSchema.shape.id,
    caseId: incompleteCaseSchema.shape.id,
    transmitter: CaseAttachmentTypeSchema,
  })
  .strict();
export type AddAttachmentToCaseSchemaType = z.infer<typeof AddAttachmentToCaseSchema>;

export const AddAttachmentToCasePrefillSchema = AddAttachmentToCaseSchema.deepPartial();
export type AddAttachmentToCasePrefillSchemaType = z.infer<typeof AddAttachmentToCasePrefillSchema>;

export const RemoveAttachmentFromCaseSchema = z
  .object({
    attachmentId: AttachmentSchema.shape.id,
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
