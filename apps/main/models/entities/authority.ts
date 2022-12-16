import z from 'zod';

export const AuthorityTypeSchema = z.enum(['CITY', 'SUBDIVISION', 'REGION']);
export type AuthorityTypeSchemaType = z.infer<typeof AuthorityTypeSchema>;

export const AuthoritySchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().min(1),
    slug: z.string().min(1).max(30).regex(new RegExp('^[a-z0-9]+(?:-[a-z0-9]+)*$')), // Regex inspired from https://ihateregex.io/expr/url-slug/ and https://stackoverflow.com/a/19256344/3608410
    mainAgentId: z.string().uuid().nullable(),
    type: AuthorityTypeSchema,
    logo: z.string().url().nullish(),
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().nullable(),
  })
  .strict();
export type AuthoritySchemaType = z.infer<typeof AuthoritySchema>;

export const PublicFacingAuthoritySchema = z.object({
  id: AuthoritySchema.shape.id,
  name: AuthoritySchema.shape.name,
  slug: AuthoritySchema.shape.slug,
  logo: AuthoritySchema.shape.logo,
});
export type PublicFacingAuthoritySchemaType = z.infer<typeof PublicFacingAuthoritySchema>;
