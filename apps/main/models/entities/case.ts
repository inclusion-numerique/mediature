import z from 'zod';

export const PlatformSchema = z.enum(['WEB']);
export type PlatformSchemaType = z.infer<typeof PlatformSchema>;

export const StatusSchema = z.enum(['TO_PROCESS', 'MAKE_XXX_CALL', 'SYNC_WITH_CITIZEN', 'SYNC_WITH_ADMINISTATION', 'ABOUT_TO_CLOSE', 'STUCK']);
export type StatusSchemaType = z.infer<typeof StatusSchema>;

export const CaseSchema = z
  .object({
    id: z.string().uuid(),
    humanId: z.number(),
    alreadyRequestedInThePast: z.boolean(),
    gotAnswerFromPreviousRequest: z.boolean().nullable(),
    description: z.string().min(100),
    units: z.string(),
    emailCopyWanted: z.boolean(),
    termReminderAt: z.date().nullable(),
    initiatedFrom: PlatformSchema,
    status: StatusSchema,
    closedAt: z.date().nullable(),
    finalConclusion: z.string().nullable(),
    nextRequirements: z.string().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().nullable(),
  })
  .strict();
export type CaseSchemaType = z.infer<typeof CaseSchema>;
