import z from 'zod';

export const AuthorityTypeSchema = z.enum(['CITY', 'SUBDIVISION', 'REGION']);
export type AuthorityTypeSchemaType = z.infer<typeof AuthorityTypeSchema>;

export const AuthoritySchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().min(1),
    mainAgentId: z.string().uuid().nullable(),
    type: AuthorityTypeSchema,
    logo: z.string().url().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().nullable(),
  })
  .strict();
export type AuthoritySchemaType = z.infer<typeof AuthoritySchema>;
