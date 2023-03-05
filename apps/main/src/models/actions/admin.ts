import z from 'zod';

import { GetterInputSchema } from '@mediature/main/src/models/actions/common';
import { AuthoritySchema } from '@mediature/main/src/models/entities/authority';
import { InvitationSchema } from '@mediature/main/src/models/entities/invitation';
import { UserSchema } from '@mediature/main/src/models/entities/user';

export const GrantAdminSchema = z
  .object({
    userId: UserSchema.shape.id,
  })
  .strict();
export type GrantAdminSchemaType = z.infer<typeof GrantAdminSchema>;

export const GrantAdminPrefillSchema = GrantAdminSchema.deepPartial();
export type GrantAdminPrefillSchemaType = z.infer<typeof GrantAdminPrefillSchema>;

export const RevokeAdminSchema = z
  .object({
    userId: UserSchema.shape.id,
  })
  .strict();
export type RevokeAdminSchemaType = z.infer<typeof RevokeAdminSchema>;

export const RevokeAdminPrefillSchema = RevokeAdminSchema.deepPartial();
export type RevokeAdminPrefillSchemaType = z.infer<typeof RevokeAdminPrefillSchema>;

export const InviteAdminSchema = z
  .object({
    inviteeEmail: InvitationSchema.shape.inviteeEmail,
    inviteeFirstname: InvitationSchema.shape.inviteeFirstname,
    inviteeLastname: InvitationSchema.shape.inviteeLastname,
  })
  .strict();
export type InviteAdminSchemaType = z.infer<typeof InviteAdminSchema>;

export const InviteAdminPrefillSchema = InviteAdminSchema.deepPartial();
export type InviteAdminPrefillSchemaType = z.infer<typeof InviteAdminPrefillSchema>;

export const ListAdminInvitationsSchema = GetterInputSchema.extend({
  filterBy: z.object({}),
}).strict();
export type ListAdminInvitationsSchemaType = z.infer<typeof ListAdminInvitationsSchema>;

export const ListAdminInvitationsPrefillSchema = ListAdminInvitationsSchema.deepPartial();
export type ListAdminInvitationsPrefillSchemaType = z.infer<typeof ListAdminInvitationsPrefillSchema>;

export const DeleteUserSchema = z
  .object({
    userId: UserSchema.shape.id,
  })
  .strict();
export type DeleteUserSchemaType = z.infer<typeof DeleteUserSchema>;

export const DeleteUserPrefillSchema = DeleteUserSchema.deepPartial();
export type DeleteUserPrefillSchemaType = z.infer<typeof DeleteUserPrefillSchema>;

export const ListUsersAndRolesSchema = GetterInputSchema.extend({
  filterBy: z.object({
    query: z.string().nullable(),
    authorityIds: z.array(AuthoritySchema.shape.id).nullable(),
    isAdmin: z.boolean().nullable(),
    isAgent: z.boolean().nullable(),
  }),
}).strict();
export type ListUsersAndRolesSchemaType = z.infer<typeof ListUsersAndRolesSchema>;

export const ListUsersAndRolesPrefillSchema = ListUsersAndRolesSchema.deepPartial();
export type ListUsersAndRolesPrefillSchemaType = z.infer<typeof ListUsersAndRolesPrefillSchema>;
