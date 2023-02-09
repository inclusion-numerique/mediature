import { countries } from 'country-data';
import z from 'zod';

export const CountryCodeSchema = z.string().refine(
  (countryCode) => {
    return !!countries[countryCode];
  },
  {
    message: 'le pays saisi est invalide',
  }
);
export type CountryCodeSchemaType = z.infer<typeof CountryCodeSchema>;
