import z from 'zod';

import { AuthoritySchema } from '@mediature/main/src/models/entities/authority';
import { InvitationSchema } from '@mediature/main/src/models/entities/invitation';

export const AgentInvitationSchema = InvitationSchema.extend({
  id: z.string().uuid(),
  invitationId: InvitationSchema.shape.id,
  authorityId: AuthoritySchema.shape.id,
  grantMainAgent: z.boolean(),
}).strict();
export type AgentInvitationSchemaType = z.infer<typeof AgentInvitationSchema>;
