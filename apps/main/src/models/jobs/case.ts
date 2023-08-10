import z from 'zod';

import { incompleteCaseSchema } from '@mediature/main/src/models/entities/case';

import { MaintenanceWrapperDataSchema } from './maintenance';

export const CreateCaseInboundEmailDataSchema = MaintenanceWrapperDataSchema.extend({
  caseId: incompleteCaseSchema.shape.id,
}).strict();
export type CreateCaseInboundEmailDataSchemaType = z.infer<typeof CreateCaseInboundEmailDataSchema>;

export const ProcessInboundMessageDataSchema = MaintenanceWrapperDataSchema.extend({
  emailPayload: z.any(),
}).strict();
export type ProcessInboundMessageDataSchemaType = z.infer<typeof ProcessInboundMessageDataSchema>;
