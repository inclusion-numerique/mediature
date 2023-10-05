import z from 'zod';

import { AddressSchema } from '@mediature/main/src/models/entities/address';
import { PhoneSchema } from '@mediature/main/src/models/entities/phone';

export const CitizenGenderIdentitySchema = z.enum(['MALE', 'FEMALE', 'NON_BINARY']);
export type CitizenGenderIdentitySchemaType = z.infer<typeof CitizenGenderIdentitySchema>;

export const CitizenRepresentationSchema = z.enum(['INDIVIDUAL', 'BUSINESS', 'PUBLIC_INSTITUTION', 'AUTHORITY', 'ASSOCIATION', 'OTHER']);
export type CitizenRepresentationSchemaType = z.infer<typeof CitizenRepresentationSchema>;

export const CitizenSchema = z
  .object({
    id: z.string().uuid(),
    email: z.string().email().nullable(),
    firstname: z.string().min(1),
    lastname: z.string().min(1),
    genderIdentity: CitizenGenderIdentitySchema.nullable(),
    representation: CitizenRepresentationSchema.nullable(),
    address: AddressSchema.nullable(),
    phone: PhoneSchema.nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().nullable(),
  })
  .strict();
export type CitizenSchemaType = z.infer<typeof CitizenSchema>;
