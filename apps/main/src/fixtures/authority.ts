import { agents } from '@mediature/main/src/fixtures/agent';
import {
  AuthoritySchema,
  AuthoritySchemaType,
  AuthorityTypeSchema,
  AuthorityWrapperSchema,
  AuthorityWrapperSchemaType,
} from '@mediature/main/src/models/entities/authority';

export const authorities: AuthoritySchemaType[] = [
  AuthoritySchema.parse({
    id: 'b79cb3ba-745e-5d9a-8903-4a02327a7e01',
    name: 'Bretagne',
    slug: 'bzh',
    mainAgentId: null,
    type: AuthorityTypeSchema.Values.REGION,
    logo: {
      id: 'e79cb3ba-745e-5d9a-8903-4a02327a7e01',
      url: 'https://via.placeholder.com/300x150',
    },
    createdAt: new Date('December 17, 2022 03:24:00 UTC'),
    updatedAt: new Date('December 19, 2022 04:33:00 UTC'),
    deletedAt: null,
  }),
  AuthoritySchema.parse({
    id: 'b79cb3ba-745e-5d9a-8903-4a02327a7e02',
    name: 'Mairie de Paris',
    slug: 'mairie-de-paris',
    mainAgentId: null,
    type: AuthorityTypeSchema.Values.CITY,
    logo: {
      id: 'e79cb3ba-745e-5d9a-8903-4a02327a7e02',
      url: 'https://via.placeholder.com/300x400',
    },
    createdAt: new Date('December 17, 2022 03:24:00 UTC'),
    updatedAt: new Date('December 19, 2022 04:33:00 UTC'),
    deletedAt: null,
  }),
  AuthoritySchema.parse({
    id: 'b79cb3ba-745e-5d9a-8903-4a02327a7e03',
    name: 'Bordeaux',
    slug: 'bordeaux',
    mainAgentId: null,
    type: AuthorityTypeSchema.Values.FEDERATION_OF_CITIES,
    logo: null,
    createdAt: new Date('December 17, 2022 03:24:00 UTC'),
    updatedAt: new Date('December 19, 2022 04:33:00 UTC'),
    deletedAt: null,
  }),
];

export const authoritiesWrappers: AuthorityWrapperSchemaType[] = [
  AuthorityWrapperSchema.parse({
    authority: authorities[0],
    mainAgent: agents[0],
    agents: [agents[0], agents[1], agents[2]],
    openCases: 2,
    closeCases: 3,
  }),
  AuthorityWrapperSchema.parse({
    authority: authorities[1],
    mainAgent: agents[0],
    agents: [agents[0], agents[1]],
    openCases: 2,
    closeCases: 3,
  }),
  AuthorityWrapperSchema.parse({
    authority: authorities[2],
    mainAgent: agents[0],
    agents: [agents[0], agents[1]],
    openCases: 2,
    closeCases: 3,
  }),
];
