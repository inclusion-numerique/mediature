import z from 'zod';

import { InvitationSchema } from '@mediature/main/src/models/entities/invitation';
import { UserSchema } from '@mediature/main/src/models/entities/user';

export const AdminSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    firstname: UserSchema.shape.firstname,
    lastname: UserSchema.shape.lastname,
    email: UserSchema.shape.email,
    profilePicture: UserSchema.shape.profilePicture,
    canEverything: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().nullable(),
  })
  .strict();
export type AdminSchemaType = z.infer<typeof AdminSchema>;

export const AdminInvitationSchema = InvitationSchema.extend({
  id: z.string().uuid(),
  invitationId: InvitationSchema.shape.id,
}).strict();
export type AdminInvitationSchemaType = z.infer<typeof AdminInvitationSchema>;
