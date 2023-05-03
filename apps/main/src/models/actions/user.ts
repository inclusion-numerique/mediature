import z from 'zod';

import { InvitationSchema, InvitationTokenSchema } from '@mediature/main/src/models/entities/invitation';
import { UserSchema } from '@mediature/main/src/models/entities/user';

export const UpdateProfileSchema = z
  .object({
    firstname: UserSchema.shape.firstname,
    lastname: UserSchema.shape.lastname,
    profilePicture: UserSchema.shape.profilePicture,
  })
  .strict();
export type UpdateProfileSchemaType = z.infer<typeof UpdateProfileSchema>;

export const UpdateProfilePrefillSchema = UpdateProfileSchema.deepPartial();
export type UpdateProfilePrefillSchemaType = z.infer<typeof UpdateProfilePrefillSchema>;

export const GetPublicFacingInvitationSchema = z
  .object({
    token: InvitationTokenSchema,
  })
  .strict();
export type GetPublicFacingInvitationSchemaType = z.infer<typeof GetPublicFacingInvitationSchema>;

export const GetPublicFacingInvitationPrefillSchema = GetPublicFacingInvitationSchema.deepPartial();
export type GetPublicFacingInvitationPrefillSchemaType = z.infer<typeof GetPublicFacingInvitationPrefillSchema>;

export const CancelInvitationSchema = z
  .object({
    invitationId: InvitationSchema.shape.id,
  })
  .strict();
export type CancelInvitationSchemaType = z.infer<typeof CancelInvitationSchema>;

export const CancelInvitationPrefillSchema = CancelInvitationSchema.deepPartial();
export type CancelInvitationPrefillSchemaType = z.infer<typeof CancelInvitationPrefillSchema>;

export const GetProfileSchema = z.object({}).strict();
export type GetProfileSchemaType = z.infer<typeof GetProfileSchema>;

export const GetProfilePrefillSchema = GetProfileSchema.deepPartial();
export type GetProfilePrefillSchemaType = z.infer<typeof GetProfilePrefillSchema>;

export const GetInterfaceSessionSchema = z.object({}).strict();
export type GetInterfaceSessionSchemaType = z.infer<typeof GetInterfaceSessionSchema>;

export const GetInterfaceSessionPrefillSchema = GetInterfaceSessionSchema.deepPartial();
export type GetInterfaceSessionPrefillSchemaType = z.infer<typeof GetInterfaceSessionPrefillSchema>;

export const GetLiveChatSettingsSchema = z.object({}).strict();
export type GetLiveChatSettingsSchemaType = z.infer<typeof GetLiveChatSettingsSchema>;

export const GetLiveChatSettingsPrefillSchema = GetLiveChatSettingsSchema.deepPartial();
export type GetLiveChatSettingsPrefillSchemaType = z.infer<typeof GetLiveChatSettingsPrefillSchema>;
