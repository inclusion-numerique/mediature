import z from 'zod';

import { UserSchema } from '@mediature/main/models/entities/user';

export const UpdateProfile = z
  .object({
    firstname: UserSchema.shape.firstname,
    lastname: UserSchema.shape.lastname,
    profilePicture: UserSchema.shape.profilePicture,
  })
  .strict();
export type UpdateProfileType = z.infer<typeof UpdateProfile>;

export const GetProfileSchema = z.object({}).strict();
export type GetProfileSchemaType = z.infer<typeof GetProfileSchema>;
