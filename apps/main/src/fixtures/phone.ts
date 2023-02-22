import { PhoneInputSchema, PhoneInputSchemaType, PhoneSchema, PhoneSchemaType, PhoneTypeSchema } from '@mediature/main/src/models/entities/phone';

export const phones: PhoneSchemaType[] = [
  PhoneSchema.parse({
    id: 'b79cb3ba-745e-5d9a-8903-4a02327a7e01',
    phoneType: PhoneTypeSchema.Values.UNSPECIFIED,
    callingCode: '+33',
    countryCode: 'FR',
    number: '611223341',
    createdAt: new Date('December 17, 2022 03:24:00 UTC'),
    updatedAt: new Date('December 19, 2022 04:33:00 UTC'),
    deletedAt: null,
  }),
  PhoneSchema.parse({
    id: 'b79cb3ba-745e-5d9a-8903-4a02327a7e02',
    phoneType: PhoneTypeSchema.Values.UNSPECIFIED,
    callingCode: '+33',
    countryCode: 'FR',
    number: '611223342',
    createdAt: new Date('December 17, 2022 03:24:00 UTC'),
    updatedAt: new Date('December 19, 2022 04:33:00 UTC'),
    deletedAt: null,
  }),
  PhoneSchema.parse({
    id: 'b79cb3ba-745e-5d9a-8903-4a02327a7e03',
    phoneType: PhoneTypeSchema.Values.UNSPECIFIED,
    callingCode: '+33',
    countryCode: 'FR',
    number: '611223343',
    createdAt: new Date('December 17, 2022 03:24:00 UTC'),
    updatedAt: new Date('December 19, 2022 04:33:00 UTC'),
    deletedAt: null,
  }),
];

export const phoneInputs: PhoneInputSchemaType[] = [
  PhoneInputSchema.parse({
    phoneType: PhoneTypeSchema.Values.UNSPECIFIED,
    callingCode: '+33',
    countryCode: 'FR',
    number: '611223341',
  }),
  PhoneInputSchema.parse({
    phoneType: PhoneTypeSchema.Values.UNSPECIFIED,
    callingCode: '+33',
    countryCode: 'FR',
    number: '611223342',
  }),
  PhoneInputSchema.parse({
    phoneType: PhoneTypeSchema.Values.UNSPECIFIED,
    callingCode: '+33',
    countryCode: 'FR',
    number: '611223343',
  }),
];
