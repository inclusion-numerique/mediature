import z from 'zod';

import { AddressSchema } from '@mediature/main/src/models/entities/address';
import { PhoneSchema } from '@mediature/main/src/models/entities/phone';

export const CitizenSchema = z
  .object({
    id: z.string().uuid(),
    email: z.string().email(),
    firstname: z.string().min(1),
    lastname: z.string().min(1),
    address: AddressSchema,
    // phone: PhoneSchema,
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().nullable(),
  })
  .strict();
export type CitizenSchemaType = z.infer<typeof CitizenSchema>;
