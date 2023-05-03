import { AgentSchema, AgentSchemaType, AgentWrapperSchema, AgentWrapperSchemaType } from '@mediature/main/src/models/entities/agent';

export const agents: AgentSchemaType[] = [
  AgentSchema.parse({
    id: 'b79cb3ba-745e-5d9a-8903-4a02327a7e01',
    userId: 'b79cb3ba-745e-5d9a-8903-4a02327a7e11',
    authorityId: 'b79cb3ba-745e-5d9a-8903-4a02327a7e21',
    firstname: 'Romain',
    lastname: 'Garcia',
    email: 'germaine38@hotmail.fr',
    profilePicture: 'https://via.placeholder.com/300x150',
    isMainAgent: false,
    createdAt: new Date('December 17, 2022 03:24:00 UTC'),
    updatedAt: new Date('December 19, 2022 04:33:00 UTC'),
    deletedAt: null,
  }),
  AgentSchema.parse({
    id: 'b79cb3ba-745e-5d9a-8903-4a02327a7e02',
    userId: 'b79cb3ba-745e-5d9a-8903-4a02327a7e21',
    authorityId: 'b79cb3ba-745e-5d9a-8903-4a02327a7e21',
    firstname: 'Aminte',
    lastname: 'Bertrand',
    email: 'justine.blanchard@hotmail.fr',
    profilePicture: 'https://via.placeholder.com/300x250',
    isMainAgent: true,
    createdAt: new Date('December 17, 2022 03:24:00 UTC'),
    updatedAt: new Date('December 19, 2022 04:33:00 UTC'),
    deletedAt: null,
  }),
  AgentSchema.parse({
    id: 'b79cb3ba-745e-5d9a-8903-4a02327a7e03',
    userId: 'b79cb3ba-745e-5d9a-8903-4a02327a7e31',
    authorityId: 'b79cb3ba-745e-5d9a-8903-4a02327a7e21',
    firstname: 'Agathon',
    lastname: 'Louis',
    email: 'aure.benoit71@hotmail.fr',
    profilePicture: 'https://via.placeholder.com/150x150',
    isMainAgent: false,
    createdAt: new Date('December 17, 2022 03:24:00 UTC'),
    updatedAt: new Date('December 19, 2022 04:33:00 UTC'),
    deletedAt: null,
  }),
];

export const agentsWrappers: AgentWrapperSchemaType[] = [
  AgentWrapperSchema.parse({
    agent: agents[0],
    openCases: 2,
    closeCases: 3,
  }),
  AgentWrapperSchema.parse({
    agent: agents[1],
    openCases: 2,
    closeCases: 3,
  }),
  AgentWrapperSchema.parse({
    agent: agents[2],
    openCases: 2,
    closeCases: 3,
  }),
];
