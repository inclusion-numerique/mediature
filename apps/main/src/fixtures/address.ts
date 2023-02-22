import { AddressSchema, AddressSchemaType } from '@mediature/main/src/models/entities/address';

export const addresses: AddressSchemaType[] = [
  AddressSchema.parse({
    id: 'b79cb3ba-745e-5d9a-8903-4a02327a7e01',
    street: '1 rue de la Gare',
    city: 'Rennes',
    postalCode: '35000',
    subdivision: '',
    countryCode: 'FR',
    createdAt: new Date('December 17, 2022 03:24:00 UTC'),
    updatedAt: new Date('December 19, 2022 04:33:00 UTC'),
    deletedAt: null,
  }),
  AddressSchema.parse({
    id: 'b79cb3ba-745e-5d9a-8903-4a02327a7e02',
    street: '2 rue de la Gare',
    city: 'Rennes',
    postalCode: '35000',
    subdivision: '',
    countryCode: 'FR',
    createdAt: new Date('December 17, 2022 03:24:00 UTC'),
    updatedAt: new Date('December 19, 2022 04:33:00 UTC'),
    deletedAt: null,
  }),
  AddressSchema.parse({
    id: 'b79cb3ba-745e-5d9a-8903-4a02327a7e03',
    street: '3 rue de la Gare',
    city: 'Rennes',
    postalCode: '35000',
    subdivision: '',
    countryCode: 'FR',
    createdAt: new Date('December 17, 2022 03:24:00 UTC'),
    updatedAt: new Date('December 19, 2022 04:33:00 UTC'),
    deletedAt: null,
  }),
];
