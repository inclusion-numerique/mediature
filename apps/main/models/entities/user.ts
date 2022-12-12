import z from 'zod';

export const UserStatusSchema = z.enum(['REGISTERED', 'CONFIRMED', 'DISABLED']);
export type UserStatusSchemaType = z.infer<typeof UserStatusSchema>;

export const UserPasswordSchema = z.string().min(1); // TODO: implement the logic min/max/lower/upper/number
export type UserPasswordSchemaType = z.infer<typeof UserPasswordSchema>;

export const UserSchema = z
  .object({
    id: z.string().uuid(),
    firstname: z.string().min(1),
    lastname: z.string().min(1),
    email: z.string().email(),
    passwordHash: z.string().min(1), // TODO: set to "z.never()"?
    status: UserStatusSchema,
    profilePicture: z.string().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().nullable(),
  })
  .strict();
export type UserSchemaType = z.infer<typeof UserSchema>;

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