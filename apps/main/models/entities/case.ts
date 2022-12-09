import z from 'zod';

export const CasePlatformSchema = z.enum(['WEB']);
export type CasePlatformSchemaType = z.infer<typeof CasePlatformSchema>;

export const CaseStatusSchema = z.enum(['TO_PROCESS', 'MAKE_XXX_CALL', 'SYNC_WITH_CITIZEN', 'SYNC_WITH_ADMINISTATION', 'ABOUT_TO_CLOSE', 'STUCK']);
export type CaseStatusSchemaType = z.infer<typeof CaseStatusSchema>;

export const CaseSchema = z
  .object({
    id: z.string().uuid(),
    humanId: z.number(),
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
