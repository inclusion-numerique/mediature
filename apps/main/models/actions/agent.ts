import z from 'zod';

import { GetterInputSchema } from '@mediature/main/models/actions/common';
import { AgentInvitationSchema, AgentSchema } from '@mediature/main/models/entities/agent';
import { AuthoritySchema } from '@mediature/main/models/entities/authority';
import { InvitationSchema } from '@mediature/main/models/entities/invitation';
import { UserSchema } from '@mediature/main/models/entities/user';

export const AddAgentSchema = z
  .object({
    userId: UserSchema.shape.id,
    authorityId: AgentSchema.shape.authorityId,
  })
  .strict();
export type AddAgentSchemaType = z.infer<typeof AddAgentSchema>;

export const RemoveAgentSchema = z
  .object({
    agentId: AgentSchema.shape.id,
    authorityId: AgentSchema.shape.authorityId,
  })
  .strict();
export type RemoveAgentSchemaType = z.infer<typeof RemoveAgentSchema>;

export const GetAgentSchema = z
  .object({
    id: AgentSchema.shape.id,
  })
  .strict();
export type GetAgentSchemaType = z.infer<typeof GetAgentSchema>;

export const ListAgentsSchema = GetterInputSchema.extend({
  filterBy: z.object({
    authorityIds: z.array(AuthoritySchema.shape.id),
  }),
}).strict();
export type ListAgentsSchemaType = z.infer<typeof ListAgentsSchema>;

export const InviteAgentSchema = z
  .object({
    inviteeEmail: InvitationSchema.shape.inviteeEmail,
    inviteeFirstname: InvitationSchema.shape.inviteeFirstname,
    inviteeLastname: InvitationSchema.shape.inviteeLastname,
    authorityId: AgentInvitationSchema.shape.authorityId,
  })
  .strict();
export type InviteAgentSchemaType = z.infer<typeof InviteAgentSchema>;
