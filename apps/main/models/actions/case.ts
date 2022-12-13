import z from 'zod';

import { GetterInputSchema } from '@mediature/main/models/actions/common';
import { AddressInputSchema } from '@mediature/main/models/entities/address';
import { AgentSchema } from '@mediature/main/models/entities/agent';
import { AttachmentSchema } from '@mediature/main/models/entities/attachment';
import { AuthoritySchema } from '@mediature/main/models/entities/authority';
import { CaseNoteSchema, CaseSchema } from '@mediature/main/models/entities/case';
import { CitizenSchema } from '@mediature/main/models/entities/citizen';
import { PhoneInputSchema } from '@mediature/main/models/entities/phone';

export const RequestCaseSchema = z
  .object({
    email: CitizenSchema.shape.email,
    firstname: CitizenSchema.shape.firstname,
    lastname: CitizenSchema.shape.lastname,
    // address: AddressInputSchema,
    // phone: PhoneInputSchema,
    alreadyRequestedInThePast: CaseSchema.shape.alreadyRequestedInThePast,
    gotAnswerFromPreviousRequest: CaseSchema.shape.gotAnswerFromPreviousRequest,
    description: CaseSchema.shape.description,
    emailCopyWanted: CaseSchema.shape.emailCopyWanted,
    // TODO: attachements
  })
  .strict();
export type RequestCaseSchemaType = z.infer<typeof RequestCaseSchema>;

export const AssignCaseSchema = z
  .object({
    caseId: CaseSchema.shape.id,
    agentIds: z.array(AgentSchema.shape.id),
  })
  .strict();
export type AssignCaseSchemaType = z.infer<typeof AssignCaseSchema>;

export const UnassignCaseSchema = z
  .object({
    caseId: CaseSchema.shape.id,
    agentIds: z.array(AgentSchema.shape.id),
  })
  .strict();
export type UnassignCaseSchemaType = z.infer<typeof UnassignCaseSchema>;

export const ListCasesSchema = GetterInputSchema.extend({
  filterBy: z.object({
    authorityIds: z.array(AuthoritySchema.shape.id).nullable(),
    unassigned: z.boolean().nullable(),
  }),
}).strict();
export type ListCasesSchemaType = z.infer<typeof ListCasesSchema>;

export const GeneratePdfFromCaseSchema = z
  .object({
    caseId: CaseSchema.shape.id,
  })
  .strict();
export type GeneratePdfFromCaseSchemaType = z.infer<typeof GeneratePdfFromCaseSchema>;

export const AddNoteToCaseSchema = z
  .object({
    caseId: CaseSchema.shape.id,
    date: CaseNoteSchema.shape.date,
    content: CaseNoteSchema.shape.content,
  })
  .strict();
export type AddNoteToCaseSchemaType = z.infer<typeof AddNoteToCaseSchema>;

export const RemoveNoteFromCaseSchema = z
  .object({
    noteId: CaseNoteSchema.shape.id,
  })
  .strict();
export type RemoveNoteFromCaseSchemaType = z.infer<typeof RemoveNoteFromCaseSchema>;

export const UpdateCaseNoteSchema = z
  .object({
    noteId: CaseNoteSchema.shape.id,
    date: CaseNoteSchema.shape.date,
    content: CaseNoteSchema.shape.content,
  })
  .strict();
export type UpdateCaseNoteSchemaType = z.infer<typeof UpdateCaseNoteSchema>;

export const AddAttachmentToCaseSchema = z
  .object({
    caseId: CaseSchema.shape.id,
    date: CaseNoteSchema.shape.date,
    content: CaseNoteSchema.shape.content,
  })
  .strict();
export type AddAttachmentToCaseSchemaType = z.infer<typeof AddAttachmentToCaseSchema>;

export const RemoveAttachmentFromCaseSchema = z
  .object({
    attachmentId: AttachmentSchema.shape.id,
  })
  .strict();
export type RemoveAttachmentFromCaseSchemaType = z.infer<typeof RemoveAttachmentFromCaseSchema>;

export const UpdateCaseAttachmentLabelSchema = z
  .object({
    attachmentId: AttachmentSchema.shape.id,
    label: AttachmentSchema.shape.name,
  })
  .strict();
export type UpdateCaseAttachmentLabelSchemaType = z.infer<typeof UpdateCaseAttachmentLabelSchema>;
