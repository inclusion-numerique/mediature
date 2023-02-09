import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';
import z from 'zod';

import { CountryCodeSchema } from '@mediature/main/src/models/entities/country';

const phoneNumberUtil = PhoneNumberUtil.getInstance();

export const PhoneTypeSchema = z.enum(['UNSPECIFIED', 'HOME', 'MOBILE']);
export type PhoneTypeSchemaType = z.infer<typeof PhoneTypeSchema>;

export const PhoneSchema = z
  .object({
    id: z.string().uuid(),
    phoneType: PhoneTypeSchema.default(PhoneTypeSchema.Values.UNSPECIFIED),
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
  .strict()
  .superRefine((data, ctx) => {
    if (data) {
      const potentialE164PhoneNumber = data.callingCode + data.number;

      // Parse with an official library and check if it works
      try {
        const parsedPhone = phoneNumberUtil.parse(potentialE164PhoneNumber, data.countryCode);

        // Some numeros can be parsed, yes, but they may not be "possible"
        // but in addition we want for consistency to always store numbers with full facultative parts like the region that can be omitted for US states for exampel
        // `isValidNumber` does the job for this check!
        if (!phoneNumberUtil.isValidNumber(parsedPhone)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `le numéro de téléphone doit avoir une combinaison valide, peut-être un oubli du code de zone`,
          });
        }

        // Just in case compare potential and computed ones since to avoid leading zeros on national number to be stored
        const e164PhoneNumber = phoneNumberUtil.format(parsedPhone, PhoneNumberFormat.E164);
        if (potentialE164PhoneNumber !== e164PhoneNumber) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `le numéro de téléphone doit avoir une combinaison valide, peut-être un zéro en trop devant`,
          });
        }
      } catch (err) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `le numéro de téléphone doit être valide`,
        });
      }
    }
  });
export type PhoneInputSchemaType = z.infer<typeof PhoneInputSchema>;
