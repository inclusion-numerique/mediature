import z from 'zod';

import { GetterInputSchema } from '@mediature/main/models/actions/common';
import { AuthoritySchema } from '@mediature/main/models/entities/authority';
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

export const ListAgentsSchema = GetterInputSchema.extend({
  filterBy: z.object({
    authorityIds: z.array(AuthoritySchema),
  }),
}).strict();
export type ListAgentsSchemaType = z.infer<typeof ListAgentsSchema>;
