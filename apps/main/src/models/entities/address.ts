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
    // Since the tool is scoped to France we force the country to simplify the forms and the UI
    countryCode: AddressSchema.shape.countryCode.default('FR'),
    subdivision: AddressSchema.shape.subdivision.default(''),
    // countryCode: AddressSchema.shape.countryCode,
    // subdivision: AddressSchema.shape.subdivision,
  })
  .strict();
export type AddressInputSchemaType = z.input<typeof AddressInputSchema>;

export function emptyAddresstoNullPreprocessor(initialValidation: z.ZodNullable<typeof AddressInputSchema>) {
  return z.preprocess((value) => {
    // Type is not propagated to this callback
    const addressValue = value as AddressInputSchemaType | null;

    if (addressValue && addressValue.street === '' && addressValue.city === '' && addressValue.postalCode === '') {
      return null;
    }

    return value;
  }, initialValidation);
}
