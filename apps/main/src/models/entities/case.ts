import z from 'zod';

import { AgentSchema } from '@mediature/main/src/models/entities/agent';
import { AttachmentSchema, UiAttachmentSchema } from '@mediature/main/src/models/entities/attachment';
import { CitizenSchema } from '@mediature/main/src/models/entities/citizen';
import { EditorStateSchema } from '@mediature/main/src/models/entities/lexical';

export const CasePlatformSchema = z.enum(['OFFICE', 'MAIL', 'PHONE', 'EMAIL', 'WEB']);
export type CasePlatformSchemaType = z.infer<typeof CasePlatformSchema>;

export const CaseStatusSchema = z.enum([
  'TO_PROCESS',
  'CONTACT_REQUESTER',
  'WAITING_FOR_REQUESTER',
  'CONTACT_ADMINISTRATION',
  'WAITING_FOR_ADMINISTATION',
  'ABOUT_TO_CLOSE',
  'CLOSED',
]);
export type CaseStatusSchemaType = z.infer<typeof CaseStatusSchema>;

export const CaseOutcomeSchema = z.enum([
  'FAVORABLE_TO_CITIZEN',
  'PARTIAL',
  'FAVORABLE_TO_ADMINISTRATION',
  'INTERNAL_FORWARD',
  'EXTERNAL_FORWARD',
  'CITIZEN_WAIVER',
  'CITIZEN_INACTIVITY',
]);
export type CaseOutcomeSchemaType = z.infer<typeof CaseOutcomeSchema>;

export const CaseDomainItemSchema = z
  .object({
    id: z.string().uuid(),
    authorityId: z.string().nullable(),
    parentId: z.string().nullable(),
    parentName: z.string().nullable(),
    name: z.string().min(1),
  })
  .strict();
export type CaseDomainItemSchemaType = z.infer<typeof CaseDomainItemSchema>;

export const CaseCompetentThirdPartyItemSchema = z
  .object({
    id: z.string().uuid(),
    authorityId: z.string().nullable(),
    parentId: z.string().nullable(),
    parentName: z.string().nullable(),
    name: z.string().min(1),
  })
  .strict();
export type CaseCompetentThirdPartyItemSchemaType = z.infer<typeof CaseCompetentThirdPartyItemSchema>;

export const incompleteCaseSchema = z
  .object({
    id: z.string().uuid(),
    humanId: z.number(),
    citizenId: z.string().uuid(),
    authorityId: z.string().uuid(),
    agentId: z.string().uuid().nullable(),
    alreadyRequestedInThePast: z.boolean(),
    gotAnswerFromPreviousRequest: z.boolean().nullable(),
    description: z.string().min(1),
    domain: CaseDomainItemSchema.nullable(),
    competent: z.boolean().nullable(),
    competentThirdParty: CaseCompetentThirdPartyItemSchema.nullable(),
    units: z.string(),
    emailCopyWanted: z.boolean(),
    termReminderAt: z.date().nullable(),
    initiatedFrom: CasePlatformSchema,
    status: CaseStatusSchema,
    closedAt: z.date().nullable(),
    outcome: CaseOutcomeSchema.nullable(),
    collectiveAgreement: z.boolean().nullable(),
    administrativeCourtNext: z.boolean().nullable(),
    finalConclusion: z.string().nullable(),
    nextRequirements: z.string().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().nullable(),
  })
  .strict();
export const CaseSchema = incompleteCaseSchema.superRefine((data, ctx) => {
  if (data) {
    if (data.alreadyRequestedInThePast === false && data.gotAnswerFromPreviousRequest !== null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `un dossier ne peut pas avoir eu une réponse de l'administration s'il est indiqué qu'aucune requête n'a été faite auparavant.`,
      });
    }

    if (data.competent === true && data.competentThirdParty !== null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `une entité tierce compétente ne peut être définie que si le dossier est marqué avec "non-compétence"`,
      });
    }

    if (data.closedAt && data.outcome === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `un type de clôture doit être spécifié quand le dossier est clôturé`,
      });
    }
  }
});
export type CaseSchemaType = z.infer<typeof CaseSchema>;

export const CaseNoteSchema = z
  .object({
    id: z.string().uuid(),
    caseId: z.string().uuid(),
    date: z.date(), // TODO: not a timestamp, should be a date (or maybe not? Hours matter?)
    content: EditorStateSchema,
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

export const CaseWrapperSchema = z
  .object({
    case: CaseSchema,
    citizen: CitizenSchema,
    agent: AgentSchema.nullable(),
    notes: z.array(CaseNoteSchema).nullable(),
    attachments: z.array(UiAttachmentSchema).nullable(),
    unprocessedMessages: z.number().nullable(),
  })
  .strict();
export type CaseWrapperSchemaType = z.infer<typeof CaseWrapperSchema>;
