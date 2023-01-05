import z from 'zod';

export const CountryCodeSchema = z.string().min(2).max(2);
export type CountryCodeSchemaType = z.infer<typeof CountryCodeSchema>;
