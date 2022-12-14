import z from 'zod';

import { GetterInputSchema } from '@mediature/main/models/actions/common';
import { AuthoritySchema } from '@mediature/main/models/entities/authority';
import { InvitationSchema } from '@mediature/main/models/entities/invitation';
import { UserSchema } from '@mediature/main/models/entities/user';

export const GrantAdminSchema = z
  .object({
    userId: UserSchema.shape.id,
  })
  .strict();
export type GrantAdminSchemaType = z.infer<typeof GrantAdminSchema>;

export const RevokeAdminSchema = z
  .object({
    userId: UserSchema.shape.id,
  })
  .strict();
export type RevokeAdminSchemaType = z.infer<typeof RevokeAdminSchema>;

export const InviteAdminSchema = z
  .object({
    inviteeEmail: InvitationSchema.shape.inviteeEmail,
    inviteeFirstname: InvitationSchema.shape.inviteeFirstname,
    inviteeLastname: InvitationSchema.shape.inviteeLastname,
  })
  .strict();
export type InviteAdminSchemaType = z.infer<typeof InviteAdminSchema>;

export const DeleteUserSchema = z
  .object({
    userId: UserSchema.shape.id,
  })
  .strict();
export type DeleteUserSchemaType = z.infer<typeof DeleteUserSchema>;

export const ListUsersAndRolesSchema = GetterInputSchema.extend({
  filterBy: z.object({
    query: z.string().nullable(),
    authorityIds: z.array(AuthoritySchema.shape.id).nullable(),
    isAdmin: z.boolean().nullable(),
    isAgent: z.boolean().nullable(),
  }),
}).strict();
export type ListUsersAndRolesSchemaType = z.infer<typeof ListUsersAndRolesSchema>;
