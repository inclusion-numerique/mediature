import { Meta, StoryFn } from '@storybook/react';
import { within } from '@storybook/testing-library';

import { userSessionContext } from '@mediature/docs/.storybook/auth';
import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { playFindMain, playFindProgressBar } from '@mediature/docs/.storybook/testing';
import { PrivateLayout } from '@mediature/main/src/app/(private)/PrivateLayout';
import { Loading as PublicLayoutLoadingStory, Lorem as PublicLayoutLoremStory } from '@mediature/main/src/app/(public)/PublicLayout.stories';
import { UserInterfaceSessionSchema, UserInterfaceSessionSchemaType } from '@mediature/main/src/models/entities/ui';
import { getTRPCMock } from '@mediature/main/src/server/mock/trpc';
import { linkRegistry } from '@mediature/main/src/utils/routes/registry';

type ComponentType = typeof PrivateLayout;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Layouts/PrivatePages',
  component: PrivateLayout,
  ...generateMetaDefault({
    parameters: {
      layout: 'fullscreen',
      msw: {
        handlers: [],
      },
    },
  }),
} as Meta<ComponentType>;

function interfaceSessionQueryFactory(session: UserInterfaceSessionSchemaType) {
  return {
    msw: {
      handlers: [
        getTRPCMock({
          type: 'query',
          path: ['getInterfaceSession'],
          response: {
            session: UserInterfaceSessionSchema.parse(session),
          },
        }),
      ],
    },
  };
}

const agentOfSample = [
  {
    id: 'b79cb3ba-745e-5d9a-8903-4a02327a7e01',
    name: 'Bretagne',
    slug: 'bzh',
    logo: null,
    isMainAgent: true,
  },
  {
    id: 'b79cb3ba-745e-5d9a-8903-4a02327a7e02',
    name: 'Mairie de Paris',
    slug: 'mairie-de-paris',
    logo: null,
    isMainAgent: true,
  },
  {
    id: 'b79cb3ba-745e-5d9a-8903-4a02327a7e03',
    name: 'Bordeaux',
    slug: 'bordeaux',
    logo: null,
    isMainAgent: true,
  },
];

const Template: StoryFn<ComponentType> = (args) => {
  return <PrivateLayout {...args} />;
};

const AsNewUserStory = Template.bind({});
AsNewUserStory.args = {};
AsNewUserStory.parameters = {
  nextAuthMock: {
    session: userSessionContext,
  },
  nextjs: {
    navigation: {
      pathname: linkRegistry.get('myCases', {
        authorityId: agentOfSample[0].id,
      }),
    },
  },
  ...interfaceSessionQueryFactory({
    agentOf: [],
    isAdmin: false,
  }),
};
AsNewUserStory.play = async ({ canvasElement }) => {
  await playFindMain(canvasElement);
};

export const AsNewUser = prepareStory(AsNewUserStory);

const AsMainAgentStory = Template.bind({});
AsMainAgentStory.args = {};
AsMainAgentStory.parameters = {
  ...AsNewUserStory.parameters,
  ...interfaceSessionQueryFactory({
    agentOf: agentOfSample,
    isAdmin: false,
  }),
};
AsMainAgentStory.play = async ({ canvasElement }) => {
  await playFindMain(canvasElement);
};

export const AsMainAgent = prepareStory(AsMainAgentStory);

const AsAdminStory = Template.bind({});
AsAdminStory.args = {};
AsAdminStory.parameters = {
  ...AsNewUserStory.parameters,
  ...interfaceSessionQueryFactory({
    agentOf: [],
    isAdmin: true,
  }),
};
AsAdminStory.play = async ({ canvasElement }) => {
  await playFindMain(canvasElement);
};

export const AsAdmin = prepareStory(AsAdminStory);

const AsMainAgentAndAdminStory = Template.bind({});
AsMainAgentAndAdminStory.args = {};
AsMainAgentAndAdminStory.parameters = {
  ...AsNewUserStory.parameters,
  ...interfaceSessionQueryFactory({
    agentOf: agentOfSample,
    isAdmin: true,
  }),
};
AsMainAgentAndAdminStory.play = async ({ canvasElement }) => {
  await playFindMain(canvasElement);
};

export const AsMainAgentAndAdmin = prepareStory(AsMainAgentAndAdminStory);

const LoremStory = Template.bind({});
LoremStory.args = {
  ...PublicLayoutLoremStory.args,
};
LoremStory.parameters = {
  ...AsNewUserStory.parameters,
};
LoremStory.play = async ({ canvasElement }) => {
  await playFindMain(canvasElement);
};

export const Lorem = prepareStory(LoremStory);
Lorem.storyName = 'With lorem';

const LoadingStory = Template.bind({});
LoadingStory.args = {
  ...PublicLayoutLoadingStory.args,
};
LoadingStory.parameters = {
  ...AsNewUserStory.parameters,
};
LoadingStory.play = async ({ canvasElement }) => {
  await playFindProgressBar(canvasElement, /chargement/i);
};

export const Loading = prepareStory(LoadingStory);
Loading.storyName = 'With loader';
