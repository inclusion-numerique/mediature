import z from 'zod';

import { incompleteCaseSchema } from '@mediature/main/src/models/entities/case';

export const CreateCaseInboundEmailDataSchema = z
  .object({
    caseId: incompleteCaseSchema.shape.id,
  })
  .strict();
export type CreateCaseInboundEmailDataSchemaType = z.infer<typeof CreateCaseInboundEmailDataSchema>;

export const ProcessInboundMessageDataSchema = z
  .object({
    emailPayload: z.any(),
  })
  .strict();
export type ProcessInboundMessageDataSchemaType = z.infer<typeof ProcessInboundMessageDataSchema>;
