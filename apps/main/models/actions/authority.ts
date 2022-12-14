import z from 'zod';

import { GetterInputSchema } from '@mediature/main/models/actions/common';
import { AuthoritySchema } from '@mediature/main/models/entities/authority';

export const CreateAuthoritySchema = z
  .object({
    name: AuthoritySchema.shape.name,
    slug: AuthoritySchema.shape.slug,
    type: AuthoritySchema.shape.type,
    logoAttachmentId: AuthoritySchema.shape.logo,
  })
  .strict();
export type CreateAuthoritySchemaType = z.infer<typeof CreateAuthoritySchema>;

export const UpdateAuthoritySchema = z
  .object({
    authorityId: AuthoritySchema.shape.id,
    name: AuthoritySchema.shape.name,
    slug: AuthoritySchema.shape.slug,
    mainAgentId: AuthoritySchema.shape.mainAgentId,
    type: AuthoritySchema.shape.type,
    logoAttachmentId: AuthoritySchema.shape.logo,
  })
  .strict();
export type UpdateAuthoritySchemaType = z.infer<typeof UpdateAuthoritySchema>;

export const DeleteAuthoritySchema = z
  .object({
    authorityId: AuthoritySchema.shape.id,
  })
  .strict();
export type DeleteAuthoritySchemaType = z.infer<typeof DeleteAuthoritySchema>;

export const GetAuthoritySchema = z
  .object({
    id: AuthoritySchema.shape.id,
  })
  .strict();
export type GetAuthoritySchemaType = z.infer<typeof GetAuthoritySchema>;

// TODO: make a public getter for getAuthority

export const ListAuthoritiesSchema = GetterInputSchema.extend({
  filterBy: z.object({}),
}).strict();
export type ListAuthoritiesSchemaType = z.infer<typeof ListAuthoritiesSchema>;
