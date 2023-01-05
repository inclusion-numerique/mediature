import z from 'zod';

import { AuthoritySchema } from '@mediature/main/src/models/entities/authority';
import { InvitationSchema } from '@mediature/main/src/models/entities/invitation';

export const AgentSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    authorityId: z.string().uuid(),
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().nullable(),
  })
  .strict();
export type AgentSchemaType = z.infer<typeof AgentSchema>;

export const AgentInvitationSchema = InvitationSchema.extend({
  id: z.string().uuid(),
  invitationId: InvitationSchema.shape.id,
  authorityId: AuthoritySchema.shape.id,
}).strict();
export type AgentInvitationSchemaType = z.infer<typeof AgentInvitationSchema>;
