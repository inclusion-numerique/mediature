import { addresses } from '@mediature/main/src/fixtures/address';
import { CitizenSchema, CitizenSchemaType } from '@mediature/main/src/models/entities/citizen';

export const citizens: CitizenSchemaType[] = [
  CitizenSchema.parse({
    id: 'b79cb3ba-745e-5d9a-8903-4a02327a7e01',
    email: 'valentin_rousseau@gmail.com',
    firstname: 'Agathon',
    lastname: 'Remy',
    address: addresses[0],
    createdAt: new Date('December 17, 2022 03:24:00'),
    updatedAt: new Date('December 19, 2022 04:33:00'),
    deletedAt: null,
  }),
  CitizenSchema.parse({
    id: 'b79cb3ba-745e-5d9a-8903-4a02327a7e02',
    email: 'guilhemine.noel@hotmail.fr',
    firstname: 'Amaliane',
    lastname: 'Baron',
    address: addresses[1],

    createdAt: new Date('December 17, 2022 03:24:00'),
    updatedAt: new Date('December 19, 2022 04:33:00'),
    deletedAt: null,
  }),
  CitizenSchema.parse({
    id: 'b79cb3ba-745e-5d9a-8903-4a02327a7e03',
    email: 'pascale.leclerc@yahoo.fr',
    firstname: 'Pénélope',
    lastname: 'Rolland',
    address: addresses[2],
    createdAt: new Date('December 17, 2022 03:24:00'),
    updatedAt: new Date('December 19, 2022 04:33:00'),
    deletedAt: null,
  }),
];
