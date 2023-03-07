import z from 'zod';

export const UserStatusSchema = z.enum(['REGISTERED', 'CONFIRMED', 'DISABLED']);
export type UserStatusSchemaType = z.infer<typeof UserStatusSchema>;

export const UserPasswordSchema = z.string().min(1); // TODO: implement the logic min/max/lower/upper/number
export type UserPasswordSchemaType = z.infer<typeof UserPasswordSchema>;

export const UserSchema = z
  .object({
    // TODO: add professional phone for colleagues?
    id: z.string().uuid(),
    firstname: z.string().min(1),
    lastname: z.string().min(1),
    email: z.string().email(),
    status: UserStatusSchema,
    profilePicture: z.string().url().nullable(),
    lastActivityAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().nullable(),
  })
  .strict();
export type UserSchemaType = z.infer<typeof UserSchema>;

export const VerificationTokenActionSchema = z.enum(['RESET_PASSWORD']);
export type VerificationTokenActionSchemaType = z.infer<typeof VerificationTokenActionSchema>;

export const VerificationTokenSchema = z
  .object({
    action: VerificationTokenActionSchema,
    token: z.string().min(1),
    identifier: UserSchema.shape.id,
    expires: z.date(),
  })
  .strict();
export type VerificationTokenSchemaType = z.infer<typeof VerificationTokenSchema>;

// This is a lite version of the user entity to be available on the frontend
export const TokenUserSchema = z
  .object({
    id: UserSchema.shape.id,
    firstname: UserSchema.shape.firstname,
    lastname: UserSchema.shape.lastname,
    email: UserSchema.shape.email,
    profilePicture: UserSchema.shape.profilePicture,
  })
  .strict();
export type TokenUserSchemaType = z.infer<typeof TokenUserSchema>;

// This is the JWT extra data
export const JwtDataSchema = z
  .object({
    sub: UserSchema.shape.id,
    email: UserSchema.shape.email,
    given_name: UserSchema.shape.firstname,
    family_name: UserSchema.shape.lastname,
    picture: UserSchema.shape.profilePicture,
  })
  .strict();
export type JwtDataSchemaType = z.infer<typeof JwtDataSchema>;
