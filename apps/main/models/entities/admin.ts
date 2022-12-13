import z from 'zod';

import { InvitationSchema } from '@mediature/main/models/entities/invitation';
import { UserSchema } from '@mediature/main/models/entities/user';

export const AdminSchema = UserSchema.extend({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  canEverything: z.boolean(),
}).strict();
export type AdminSchemaType = z.infer<typeof AdminSchema>;

export const AdminInvitationSchema = InvitationSchema.extend({
  id: z.string().uuid(),
  invitationId: InvitationSchema.shape.id,
}).strict();
export type AdminInvitationSchemaType = z.infer<typeof AdminInvitationSchema>;
