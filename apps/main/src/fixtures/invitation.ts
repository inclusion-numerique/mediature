import { InvitationSchema, InvitationSchemaType, InvitationStatusSchema } from '@mediature/main/src/models/entities/invitation';

export const invitations: InvitationSchemaType[] = [
  InvitationSchema.parse({
    id: 'b79cb3ba-745e-5d9a-8903-4a02327a7e01',
    inviteeEmail: 'jean@france.fr',
    inviteeFirstname: 'Jean',
    inviteeLastname: 'Derrien',
    issuer: {
      id: 'c79cb3ba-745e-5d9a-8903-4a02327a7e01',
      email: 'pascale.leclerc@yahoo.fr',
      firstname: 'Pascale',
      lastname: 'Leclerc',
    },
    status: InvitationStatusSchema.Values.PENDING,
    createdAt: new Date('December 17, 2022 03:24:00 UTC'),
    updatedAt: new Date('December 19, 2022 04:33:00 UTC'),
    deletedAt: null,
  }),
  InvitationSchema.parse({
    id: 'b79cb3ba-745e-5d9a-8903-4a02327a7e02',
    inviteeEmail: 'thomas@france.fr',
    inviteeFirstname: 'Thomas',
    inviteeLastname: 'Berger',
    issuer: {
      id: 'c79cb3ba-745e-5d9a-8903-4a02327a7e02',
      email: 'pascale.leclerc@yahoo.fr',
      firstname: 'Pascale',
      lastname: 'Leclerc',
    },
    status: InvitationStatusSchema.Values.PENDING,
    createdAt: new Date('December 17, 2022 03:24:00 UTC'),
    updatedAt: new Date('December 19, 2022 04:33:00 UTC'),
    deletedAt: null,
  }),
  InvitationSchema.parse({
    id: 'b79cb3ba-745e-5d9a-8903-4a02327a7e03',
    inviteeEmail: 'loic@france.fr',
    inviteeFirstname: 'Loïc',
    inviteeLastname: 'Picard',
    issuer: {
      id: 'c79cb3ba-745e-5d9a-8903-4a02327a7e03',
      email: 'pascale.leclerc@yahoo.fr',
      firstname: 'Pascale',
      lastname: 'Leclerc',
    },
    status: InvitationStatusSchema.Values.PENDING,
    createdAt: new Date('December 17, 2022 03:24:00 UTC'),
    updatedAt: new Date('December 19, 2022 04:33:00 UTC'),
    deletedAt: null,
  }),
];
