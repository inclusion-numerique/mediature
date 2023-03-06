import z from 'zod';

import { UserSchema } from './user';

export const AgentSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    authorityId: z.string().uuid(),
    firstname: UserSchema.shape.firstname,
    lastname: UserSchema.shape.lastname,
    email: UserSchema.shape.email,
    profilePicture: UserSchema.shape.profilePicture,
    isMainAgent: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().nullable(),
  })
  .strict();
export type AgentSchemaType = z.infer<typeof AgentSchema>;

export const AgentWrapperSchema = z
  .object({
    agent: AgentSchema,
    openCases: z.number().int().positive(),
    closeCases: z.number().int().positive(),
  })
  .strict();
export type AgentWrapperSchemaType = z.infer<typeof AgentWrapperSchema>;
