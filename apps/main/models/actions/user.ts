import z from 'zod';

import { UserSchema } from '@mediature/main/models/entities/user';

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

export const GetProfileSchema = z.object({}).strict();
export type GetProfileSchemaType = z.infer<typeof GetProfileSchema>;

export const GetProfilePrefillSchema = GetProfileSchema.deepPartial();
export type GetProfilePrefillSchemaType = z.infer<typeof GetProfilePrefillSchema>;
