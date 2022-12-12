import z from 'zod';

import { UserPasswordSchema, UserSchema } from '@mediature/main/models/entities/user';

export const SignInCaseSchema = z
  .object({
    email: UserSchema.shape.email,
    password: UserPasswordSchema,
    rememberMe: z.boolean(),
  })
  .required()
  .strict();
export type SignInCaseSchemaType = z.infer<typeof SignInCaseSchema>;
