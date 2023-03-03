import z from 'zod';

import { InvitationSchema } from '@mediature/main/src/models/entities/invitation';
import { UserSchema } from '@mediature/main/src/models/entities/user';

export const UpdateProfileSchema = z
  .object({
    firstname: UserSchema.shape.firstname,
    lastname: UserSchema.shape.lastname,
    profilePicture: UserSchema.shape.profilePicture,
  })
  .strict();
export type UpdateProfileType = z.infer<typeof UpdateProfileSchema>;

export const UpdateProfilePrefillSchema = UpdateProfileSchema.deepPartial();
export type UpdateProfilePrefillSchemaType = z.infer<typeof UpdateProfilePrefillSchema>;

export const GetPublicFacingInvitationSchema = z
  .object({
    token: InvitationSchema.shape.token,
  })
  .strict();
export type GetPublicFacingInvitationSchemaType = z.infer<typeof GetPublicFacingInvitationSchema>;

export const GetPublicFacingInvitationPrefillSchema = GetPublicFacingInvitationSchema.deepPartial();
export type GetPublicFacingInvitationPrefillSchemaType = z.infer<typeof GetPublicFacingInvitationPrefillSchema>;

export const GetProfileSchema = z.object({}).strict();
export type GetProfileSchemaType = z.infer<typeof GetProfileSchema>;

export const GetProfilePrefillSchema = GetProfileSchema.deepPartial();
export type GetProfilePrefillSchemaType = z.infer<typeof GetProfilePrefillSchema>;

export const GetInterfaceSessionSchema = z.object({}).strict();
export type GetInterfaceSessionSchemaType = z.infer<typeof GetInterfaceSessionSchema>;

export const GetInterfaceSessionPrefillSchema = GetInterfaceSessionSchema.deepPartial();
export type GetInterfaceSessionPrefillSchemaType = z.infer<typeof GetInterfaceSessionPrefillSchema>;
