import z from 'zod';

import { CountryCodeSchema } from '@mediature/main/models/entities/country';

export const PhoneTypeSchema = z.enum(['UNSPECIFIED', 'HOME', 'MOBILE']);
export type PhoneTypeSchemaType = z.infer<typeof PhoneTypeSchema>;

export const PhoneSchema = z
  .object({
    id: z.string().uuid(),
    phoneType: PhoneTypeSchema.default('UNSPECIFIED'),
    callingCode: z.string().min(1).max(4),
    countryCode: CountryCodeSchema,
    number: z.string().min(1).max(20),
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().nullable(),
  })
  .strict();
export type PhoneSchemaType = z.infer<typeof PhoneSchema>;

export const PhoneInputSchema = z
  .object({
    phoneType: PhoneSchema.shape.phoneType,
    callingCode: PhoneSchema.shape.callingCode,
    countryCode: PhoneSchema.shape.countryCode,
    number: PhoneSchema.shape.number,
  })
  .strict();
export type PhoneInputSchemaType = z.infer<typeof PhoneInputSchema>;
