import z from 'zod';

import { GetterInputSchema } from '@mediature/main/src/models/actions/common';
import { AgentSchema } from '@mediature/main/src/models/entities/agent';
import { AgentInvitationSchema } from '@mediature/main/src/models/entities/agent-invitation';
import { AuthoritySchema } from '@mediature/main/src/models/entities/authority';
import { InvitationSchema, InvitationStatusSchema } from '@mediature/main/src/models/entities/invitation';
import { UserSchema } from '@mediature/main/src/models/entities/user';

export const AddAgentSchema = z
  .object({
    userId: UserSchema.shape.id,
    authorityId: AgentSchema.shape.authorityId,
    grantMainAgent: z.boolean(),
  })
  .strict();
export type AddAgentSchemaType = z.infer<typeof AddAgentSchema>;

export const AddAgentPrefillSchema = AddAgentSchema.deepPartial();
export type AddAgentPrefillSchemaType = z.infer<typeof AddAgentPrefillSchema>;

export const GrantMainAgentSchema = z
  .object({
    agentId: AgentSchema.shape.id,
    authorityId: AgentSchema.shape.authorityId,
  })
  .strict();
export type GrantMainAgentSchemaType = z.infer<typeof GrantMainAgentSchema>;

export const GrantMainAgentPrefillSchema = GrantMainAgentSchema.deepPartial();
export type GrantMainAgentPrefillSchemaType = z.infer<typeof GrantMainAgentPrefillSchema>;

export const RemoveAgentSchema = z
  .object({
    agentId: AgentSchema.shape.id,
    authorityId: AgentSchema.shape.authorityId,
  })
  .strict();
export type RemoveAgentSchemaType = z.infer<typeof RemoveAgentSchema>;

export const RemoveAgentPrefillSchema = RemoveAgentSchema.deepPartial();
export type RemoveAgentPrefillSchemaType = z.infer<typeof RemoveAgentPrefillSchema>;

export const GetAgentSchema = z
  .object({
    id: AgentSchema.shape.id,
  })
  .strict();
export type GetAgentSchemaType = z.infer<typeof GetAgentSchema>;

export const GetAgentPrefillSchema = GetAgentSchema.deepPartial();
export type GetAgentPrefillSchemaType = z.infer<typeof GetAgentPrefillSchema>;

export const ListAgentsSchema = GetterInputSchema.extend({
  filterBy: z.object({
    authorityIds: z.array(AuthoritySchema.shape.id),
  }),
}).strict();
export type ListAgentsSchemaType = z.infer<typeof ListAgentsSchema>;

export const ListAgentsPrefillSchema = ListAgentsSchema.deepPartial();
export type ListAgentsPrefillSchemaType = z.infer<typeof ListAgentsPrefillSchema>;

export const InviteAgentSchema = z
  .object({
    inviteeEmail: InvitationSchema.shape.inviteeEmail,
    inviteeFirstname: InvitationSchema.shape.inviteeFirstname,
    inviteeLastname: InvitationSchema.shape.inviteeLastname,
    authorityId: AgentInvitationSchema.shape.authorityId,
    grantMainAgent: AgentInvitationSchema.shape.grantMainAgent,
  })
  .strict();
export type InviteAgentSchemaType = z.infer<typeof InviteAgentSchema>;

export const InviteAgentPrefillSchema = InviteAgentSchema.deepPartial().strict();
export type InviteAgentPrefillSchemaType = z.infer<typeof InviteAgentPrefillSchema>;

export const ListAgentInvitationsSchema = GetterInputSchema.extend({
  filterBy: z.object({
    authorityIds: z.array(AuthoritySchema.shape.id),
    status: InvitationStatusSchema.nullish(),
  }),
}).strict();
export type ListAgentInvitationsSchemaType = z.infer<typeof ListAgentInvitationsSchema>;

export const ListAgentInvitationsPrefillSchema = ListAgentInvitationsSchema.deepPartial();
export type ListAgentInvitationsPrefillSchemaType = z.infer<typeof ListAgentInvitationsPrefillSchema>;
