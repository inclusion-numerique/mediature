import z from 'zod';

import { AttachmentSchema } from '@mediature/main/src/models/entities/attachment';

export const CasePlatformSchema = z.enum(['WEB']);
export type CasePlatformSchemaType = z.infer<typeof CasePlatformSchema>;

export const CaseStatusSchema = z.enum(['TO_PROCESS', 'MAKE_XXX_CALL', 'SYNC_WITH_CITIZEN', 'SYNC_WITH_ADMINISTATION', 'ABOUT_TO_CLOSE', 'STUCK']);
export type CaseStatusSchemaType = z.infer<typeof CaseStatusSchema>;

export const CaseSchema = z
  .object({
    id: z.string().uuid(),
    humanId: z.number(),
    citizenId: z.string().uuid(),
    authorityId: z.string().uuid(),
    agentId: z.string().uuid().nullable(),
    alreadyRequestedInThePast: z.boolean(),
    gotAnswerFromPreviousRequest: z.boolean().nullable(),
    // TODO: if first false, second should be null... use superRefine() to manage this?
    description: z.string().min(100),
    units: z.string(),
    emailCopyWanted: z.boolean(),
    termReminderAt: z.date().nullable(),
    initiatedFrom: CasePlatformSchema,
    status: CaseStatusSchema,
    closedAt: z.date().nullable(),
    finalConclusion: z.string().nullable(),
    nextRequirements: z.string().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().nullable(),
  })
  .strict();
export type CaseSchemaType = z.infer<typeof CaseSchema>;

export const CaseNoteSchema = z
  .object({
    id: z.string().uuid(),
    caseId: z.string().uuid(),
    date: z.date(), // TODO: not a timestamp, should be a date (or maybe not? Hours matter?)
    content: z.string().min(1),
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().nullable(),
  })
  .strict();
export type CaseNoteSchemaType = z.infer<typeof CaseNoteSchema>;

export const CaseAttachmentTypeSchema = z.enum(['AGENT', 'ADMINISTRATION', 'CITIZEN']);
export type CaseAttachmentTypeSchemaType = z.infer<typeof CaseAttachmentTypeSchema>;

export const CaseAttachmentSchema = AttachmentSchema.extend({
  caseId: z.string().uuid(),
  transmitter: CaseAttachmentTypeSchema,
}).strict();
export type CaseAttachmentSchemaType = z.infer<typeof CaseAttachmentSchema>;

// TODO: to use or to remove? (is attachment meaningful on notes)
export const CaseNoteAttachmentSchema = AttachmentSchema.extend({
  noteId: z.string().uuid(),
  transmitter: CaseAttachmentTypeSchema,
}).strict();
export type CaseNoteAttachmentSchemaType = z.infer<typeof CaseNoteAttachmentSchema>;
