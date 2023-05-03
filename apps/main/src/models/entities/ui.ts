import z from 'zod';

import { PublicFacingAuthoritySchema } from '@mediature/main/src/models/entities/authority';

export const UserInterfaceAuthoritySchema = PublicFacingAuthoritySchema.extend({
  isMainAgent: z.boolean(),
  assignedUnprocessedMessages: z.number().nullable(),
}).strict();
export type UserInterfaceAuthoritySchemaType = z.infer<typeof UserInterfaceAuthoritySchema>;

export const UserInterfaceSessionSchema = z
  .object({
    agentOf: z.array(UserInterfaceAuthoritySchema),
    isAdmin: z.boolean(),
  })
  .strict();
export type UserInterfaceSessionSchemaType = z.infer<typeof UserInterfaceSessionSchema>;
