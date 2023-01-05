import z from 'zod';

import { InvitationSchema } from '@mediature/main/src/models/entities/invitation';
import { UserPasswordSchema, UserSchema, VerificationTokenSchema } from '@mediature/main/src/models/entities/user';

export const SignInSchema = z
  .object({
    email: UserSchema.shape.email,
    password: UserPasswordSchema,
    rememberMe: z.boolean(),
  })
  .strict();
export type SignInSchemaType = z.infer<typeof SignInSchema>;

export const SignInPrefillSchema = SignInSchema.deepPartial();
export type SignInPrefillSchemaType = z.infer<typeof SignInPrefillSchema>;

export const SignUpSchema = z.object({
  invitationToken: InvitationSchema.shape.token,
  email: UserSchema.shape.email,
  password: UserPasswordSchema,
  firstname: UserSchema.shape.firstname,
  lastname: UserSchema.shape.lastname,
  termsAccepted: z.literal<boolean>(true),
});
export type SignUpSchemaType = z.infer<typeof SignUpSchema>;

export const SignUpPrefillSchema = SignUpSchema.deepPartial();
export type SignUpPrefillSchemaType = z.infer<typeof SignUpPrefillSchema>;

export const RequestNewPasswordSchema = z
  .object({
    email: UserSchema.shape.email,
  })
  .strict();
export type RequestNewPasswordSchemaType = z.infer<typeof RequestNewPasswordSchema>;

export const RequestNewPasswordPrefillSchema = RequestNewPasswordSchema.deepPartial();
export type RequestNewPasswordPrefillSchemaType = z.infer<typeof RequestNewPasswordPrefillSchema>;

export const ResetPasswordSchema = z
  .object({
    token: VerificationTokenSchema.shape.token,
    password: UserPasswordSchema,
  })
  .strict();
export type ResetPasswordSchemaType = z.infer<typeof ResetPasswordSchema>;

export const ResetPasswordPrefillSchema = ResetPasswordSchema.deepPartial();
export type ResetPasswordPrefillSchemaType = z.infer<typeof ResetPasswordPrefillSchema>;

export const ChangePasswordSchema = z
  .object({
    currentPassword: UserPasswordSchema,
    newPassword: UserPasswordSchema,
  })
  .strict();
export type ChangePasswordSchemaType = z.infer<typeof ChangePasswordSchema>;

export const ChangePasswordPrefillSchema = ChangePasswordSchema.deepPartial();
export type ChangePasswordPrefillSchemaType = z.infer<typeof ChangePasswordPrefillSchema>;
