import z from 'zod';

export const InvitationStatusSchema = z.enum(['PENDING', 'ACCEPTED', 'CANCELED']);
export type InvitationStatusSchemaType = z.infer<typeof InvitationStatusSchema>;

export const InvitationIssuerSchema = z
  .object({
    id: z.string().uuid(),
    email: z.string().email(),
    firstname: z.string().nullable(),
    lastname: z.string().nullable(),
  })
  .strict();
export type InvitationIssuerSchemaType = z.infer<typeof InvitationIssuerSchema>;

export const InvitationTokenSchema = z.string().min(1);
export type InvitationTokenSchemaType = z.infer<typeof InvitationTokenSchema>;

export const InvitationSchema = z
  .object({
    id: z.string().uuid(),
    inviteeEmail: z.string().email(),
    inviteeFirstname: z.string().nullable(),
    inviteeLastname: z.string().nullable(),
    issuer: InvitationIssuerSchema,
    status: InvitationStatusSchema,
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().nullable(),
  })
  .strict();
export type InvitationSchemaType = z.infer<typeof InvitationSchema>;

export const PublicFacingInvitationSchema = z.object({
  inviteeEmail: InvitationSchema.shape.inviteeEmail,
  inviteeFirstname: InvitationSchema.shape.inviteeFirstname,
  inviteeLastname: InvitationSchema.shape.inviteeLastname,
  issuer: InvitationSchema.shape.issuer,
  status: InvitationSchema.shape.status,
});
export type PublicFacingInvitationSchemaType = z.infer<typeof PublicFacingInvitationSchema>;
