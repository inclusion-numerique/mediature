import z from 'zod';

import { GetterInputSchema } from '@mediature/main/src/models/actions/common';
import { AttachmentInputSchema } from '@mediature/main/src/models/entities/attachment';
import { AuthoritySchema, PublicFacingAuthoritySchema } from '@mediature/main/src/models/entities/authority';

export const CreateAuthoritySchema = z.object({
  name: AuthoritySchema.shape.name,
  slug: AuthoritySchema.shape.slug,
  type: AuthoritySchema.shape.type,
  logoAttachmentId: AttachmentInputSchema.nullable(),
});
export type CreateAuthoritySchemaType = z.infer<typeof CreateAuthoritySchema>;

export const CreateAuthorityPrefillSchema = CreateAuthoritySchema.deepPartial();
export type CreateAuthorityPrefillSchemaType = z.infer<typeof CreateAuthorityPrefillSchema>;

export const UpdateAuthoritySchema = z
  .object({
    authorityId: AuthoritySchema.shape.id,
    name: AuthoritySchema.shape.name,
    type: AuthoritySchema.shape.type,
    logoAttachmentId: AttachmentInputSchema.nullable(),
  })
  .strict();
export type UpdateAuthoritySchemaType = z.infer<typeof UpdateAuthoritySchema>;

export const UpdateAuthorityPrefillSchema = UpdateAuthoritySchema.deepPartial();
export type UpdateAuthorityPrefillSchemaType = z.infer<typeof UpdateAuthorityPrefillSchema>;

export const DeleteAuthoritySchema = z
  .object({
    authorityId: AuthoritySchema.shape.id,
  })
  .strict();
export type DeleteAuthoritySchemaType = z.infer<typeof DeleteAuthoritySchema>;

export const DeleteAuthorityPrefillSchema = DeleteAuthoritySchema.deepPartial();
export type DeleteAuthorityPrefillSchemaType = z.infer<typeof DeleteAuthorityPrefillSchema>;

export const GetAuthoritySchema = z
  .object({
    id: AuthoritySchema.shape.id,
  })
  .strict();
export type GetAuthoritySchemaType = z.infer<typeof GetAuthoritySchema>;

export const GetAuthorityPrefillSchema = GetAuthoritySchema.deepPartial();
export type GetAuthorityPrefillSchemaType = z.infer<typeof GetAuthorityPrefillSchema>;

export const GetPublicFacingAuthoritySchema = z
  .object({
    slug: PublicFacingAuthoritySchema.shape.slug,
  })
  .strict();
export type GetPublicFacingAuthoritySchemaType = z.infer<typeof GetPublicFacingAuthoritySchema>;

export const GetPublicFacingAuthorityPrefillSchema = GetPublicFacingAuthoritySchema.deepPartial();
export type GetPublicFacingAuthorityPrefillSchemaType = z.infer<typeof GetPublicFacingAuthorityPrefillSchema>;

export const ListAuthoritiesSchema = GetterInputSchema.extend({
  filterBy: z.object({
    query: z.string().nullable(),
  }),
}).strict();
export type ListAuthoritiesSchemaType = z.infer<typeof ListAuthoritiesSchema>;

export const ListAuthoritiesPrefillSchema = ListAuthoritiesSchema.deepPartial();
export type ListAuthoritiesPrefillSchemaType = z.infer<typeof ListAuthoritiesPrefillSchema>;
