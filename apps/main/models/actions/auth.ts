import z from 'zod';

import { InvitationSchema } from '@mediature/main/models/entities/invitation';
import { UserPasswordSchema, UserSchema, VerificationTokenSchema } from '@mediature/main/models/entities/user';

export const SignInSchema = z
  .object({
    email: UserSchema.shape.email,
    password: UserPasswordSchema,
    rememberMe: z.boolean(),
  })
  .strict();
export type SignInSchemaType = z.infer<typeof SignInSchema>;

export const SignUpSchema = z
  .object({
    invitationToken: InvitationSchema.shape.token.nullable(), // TODO: must be required in the future
    email: UserSchema.shape.email,
    password: UserPasswordSchema,
    firstname: UserSchema.shape.firstname,
    lastname: UserSchema.shape.lastname,
  })
  .strict();
export type SignUpSchemaType = z.infer<typeof SignUpSchema>;

export const RequestNewPasswordSchema = z
  .object({
    email: UserSchema.shape.email,
  })
  .strict();
export type RequestNewPasswordSchemaType = z.infer<typeof RequestNewPasswordSchema>;

export const ResetPasswordSchema = z
  .object({
    token: VerificationTokenSchema.shape.token,
    password: UserPasswordSchema,
  })
  .strict();
export type ResetPasswordSchemaType = z.infer<typeof ResetPasswordSchema>;

export const ChangePasswordSchema = z
  .object({
    currentPassword: UserPasswordSchema,
    newPassword: UserPasswordSchema,
  })
  .strict();
export type ChangePasswordSchemaType = z.infer<typeof ChangePasswordSchema>;
