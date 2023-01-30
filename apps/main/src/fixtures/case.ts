import { citizens } from '@mediature/main/src/fixtures/citizen';
import {
  CaseNoteSchema,
  CaseNoteSchemaType,
  CaseSchema,
  CaseSchemaType,
  CaseWrapperSchema,
  CaseWrapperSchemaType,
} from '@mediature/main/src/models/entities/case';
import sampleHello from '@mediature/ui/src/Editor/sample-hello.lexical';

export const cases: CaseSchemaType[] = [
  CaseSchema.parse({
    id: 'b79cb3ba-745e-5d9a-8903-4a02327a7e01',
    humanId: 132,
    citizenId: 'b79cb3ba-745e-5d9a-8903-4a02327a7e11',
    authorityId: 'b79cb3ba-745e-5d9a-8903-4a02327a7e21',
    agentId: 'b79cb3ba-745e-5d9a-8903-4a02327a7e31',
    alreadyRequestedInThePast: false,
    gotAnswerFromPreviousRequest: null,
    description: `Veritatis ducimus quas atque. Velit cumque sunt tempore laboriosam nesciunt beatae aut. Blanditiis explicabo sint ut omnis doloribus necessitatibus magni molestias perspiciatis. Eveniet enim optio tenetur non voluptatum facilis. Harum reprehenderit quos nesciunt tenetur ut quo qui. Eos non est illo et dolorum ipsa.

Ad quasi cum ut ipsa harum accusantium minima quo magnam. Similique repellendus ab dolor magnam officiis laboriosam repudiandae vitae. Rem aut quasi. Repudiandae vel aut commodi. Ullam deserunt nesciunt ullam quibusdam consequatur dolor reiciendis.

Sint sunt sed praesentium eum et consequuntur sint. Corporis molestiae quaerat libero amet. Architecto provident recusandae.`,
    units: '',
    emailCopyWanted: false,
    termReminderAt: null,
    initiatedFrom: 'WEB',
    status: 'TO_PROCESS',
    closedAt: null,
    finalConclusion: null,
    nextRequirements: null,
    createdAt: new Date('December 17, 2022 03:24:00'),
    updatedAt: new Date('December 19, 2022 04:33:00'),
    deletedAt: null,
  }),
  CaseSchema.parse({
    id: 'b79cb3ba-745e-5d9a-8903-4a02327a7e02',
    humanId: 192,
    citizenId: 'b79cb3ba-745e-5d9a-8903-4a02327a7e12',
    authorityId: 'b79cb3ba-745e-5d9a-8903-4a02327a7e22',
    agentId: 'b79cb3ba-745e-5d9a-8903-4a02327a7e32',
    alreadyRequestedInThePast: false,
    gotAnswerFromPreviousRequest: null,
    description:
      'Saepe itaque autem. Quibusdam magnam aliquid nihil. Autem mollitia ab. Blanditiis beatae odit molestiae dolores inventore tempora in blanditiis. Error tempore unde ex neque temporibus occaecati. Quia consectetur tenetur aut nam id.',
    units: '',
    emailCopyWanted: false,
    termReminderAt: null,
    initiatedFrom: 'WEB',
    status: 'TO_PROCESS',
    closedAt: null,
    finalConclusion: null,
    nextRequirements: null,
    createdAt: new Date('December 17, 2022 03:24:00'),
    updatedAt: new Date('December 19, 2022 04:33:00'),
    deletedAt: null,
  }),
  CaseSchema.parse({
    id: 'b79cb3ba-745e-5d9a-8903-4a02327a7e03',
    humanId: 245,
    citizenId: 'b79cb3ba-745e-5d9a-8903-4a02327a7e13',
    authorityId: 'b79cb3ba-745e-5d9a-8903-4a02327a7e23',
    agentId: 'b79cb3ba-745e-5d9a-8903-4a02327a7e33',
    alreadyRequestedInThePast: false,
    gotAnswerFromPreviousRequest: null,
    description:
      'Quidem maxime natus veritatis voluptatem molestiae similique omnis voluptas voluptas. Consequatur nam vero architecto reiciendis qui quis vitae odio dolore. Ut odio illo quaerat vel maxime sit vitae. Velit velit id perspiciatis consequatur velit veniam non.',
    units: '',
    emailCopyWanted: false,
    termReminderAt: null,
    initiatedFrom: 'WEB',
    status: 'TO_PROCESS',
    closedAt: new Date('December 22, 2022 03:24:00'),
    finalConclusion: 'Alias et tempore ut maxime sapiente. Exercitationem qui non quidem sequi. Blanditiis totam nesciunt.',
    nextRequirements: 'Adipisci fugit id. Unde sit nobis. Vitae voluptates harum vel.',
    createdAt: new Date('December 17, 2022 03:24:00'),
    updatedAt: new Date('December 19, 2022 04:33:00'),
    deletedAt: null,
  }),
];

export const casesWrappers: CaseWrapperSchemaType[] = [
  CaseWrapperSchema.parse({
    case: cases[0],
    citizen: citizens[0],
  }),
  CaseWrapperSchema.parse({
    case: cases[1],
    citizen: citizens[1],
  }),
  CaseWrapperSchema.parse({
    case: cases[2],
    citizen: citizens[2],
  }),
];

export const notes: CaseNoteSchemaType[] = [
  CaseNoteSchema.parse({
    id: 'd79cb3ba-745e-5d9a-8903-4a02327a7e01',
    caseId: 'd79cb3ba-745e-5d9a-8903-4a02327a7e11',
    date: new Date('December 15, 2022 03:24:00'),
    content: sampleHello,
    createdAt: new Date('December 17, 2022 03:24:00'),
    updatedAt: new Date('December 19, 2022 04:33:00'),
    deletedAt: null,
  }),
  CaseNoteSchema.parse({
    id: 'd79cb3ba-745e-5d9a-8903-4a02327a7e02',
    caseId: 'd79cb3ba-745e-5d9a-8903-4a02327a7e12',
    date: new Date('December 15, 2022 03:24:00'),
    content: sampleHello,
    createdAt: new Date('December 17, 2022 03:24:00'),
    updatedAt: new Date('December 19, 2022 04:33:00'),
    deletedAt: null,
  }),
  CaseNoteSchema.parse({
    id: 'd79cb3ba-745e-5d9a-8903-4a02327a7e03',
    caseId: 'd79cb3ba-745e-5d9a-8903-4a02327a7e13',
    date: new Date('December 15, 2022 03:24:00'),
    content: sampleHello,
    createdAt: new Date('December 17, 2022 03:24:00'),
    updatedAt: new Date('December 19, 2022 04:33:00'),
    deletedAt: null,
  }),
];
