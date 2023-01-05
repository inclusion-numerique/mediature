import z from 'zod';

export const CitizenSchema = z
  .object({
    id: z.string().uuid(),
    email: z.string().email(),
    firstname: z.string().min(1),
    lastname: z.string().min(1),
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().nullable(),
  })
  .strict();
export type CitizenSchemaType = z.infer<typeof CitizenSchema>;
