import z from 'zod';

import { CountryCodeSchema } from '@mediature/main/src/models/entities/country';

export const AddressSchema = z
  .object({
    id: z.string().uuid(),
    street: z.string().min(1).max(200),
    city: z.string().min(1).max(200),
    postalCode: z.string().min(1).max(20),
    countryCode: CountryCodeSchema,
    subdivision: z.string().max(100),
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().nullable(),
  })
  .strict();
export type AddressSchemaType = z.infer<typeof AddressSchema>;

export const AddressInputSchema = z
  .object({
    street: AddressSchema.shape.street,
    city: AddressSchema.shape.city,
    postalCode: AddressSchema.shape.postalCode,
    countryCode: AddressSchema.shape.countryCode,
    subdivision: AddressSchema.shape.subdivision,
  })
  .strict();
export type AddressInputSchemaType = z.infer<typeof AddressInputSchema>;
