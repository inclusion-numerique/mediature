import { Meta, StoryFn } from '@storybook/react';

import { userSessionContext } from '@mediature/docs/.storybook/auth';
import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { Normal as PrivateLayoutNormalStory } from '@mediature/main/src/app/(private)/PrivateLayout.stories';
import { AgentListPage } from '@mediature/main/src/app/(private)/dashboard/authority/[authorityId]/agent/list/AgentListPage';
import { agentsWrappers } from '@mediature/main/src/fixtures/agent';
import { getTRPCMock } from '@mediature/main/src/server/mock/trpc';

const { generateMetaDefault, prepareStory } = StoryHelperFactory<typeof AgentListPage>();

export default {
  title: 'Pages/AgentList',
  component: AgentListPage,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<typeof AgentListPage>;

const defaultMswParameters = {
  msw: {
    handlers: [
      getTRPCMock({
        type: 'query',
        path: ['listAgents'],
        response: {
          agentsWrappers: [agentsWrappers[0], agentsWrappers[1], agentsWrappers[2]],
        },
      }),
      getTRPCMock({
        type: 'mutation',
        path: ['removeAgent'],
        response: undefined,
      }),
    ],
  },
};

const defaultAuthParameters = {
  nextAuthMock: {
    session: userSessionContext,
  },
};

const commonNextParamsParameters = {
  params: {
    authorityId: 'b79cb3ba-745e-5d9a-8903-4a02327a7e01',
  },
};

const Template: StoryFn<typeof AgentListPage> = (args) => {
  return <AgentListPage {...args} />;
};

const NormalStory = Template.bind({});
NormalStory.args = {
  ...commonNextParamsParameters,
};
NormalStory.parameters = {
  ...defaultMswParameters,
  ...defaultAuthParameters,
};

export const Normal = prepareStory(NormalStory, {});

const WithLayoutStory = Template.bind({});
WithLayoutStory.args = {
  ...commonNextParamsParameters,
};

export const WithLayout = prepareStory(WithLayoutStory, {
  layoutStory: PrivateLayoutNormalStory,
});
WithLayoutStory.parameters = {
  layout: 'fullscreen',
  ...defaultMswParameters,
  ...defaultAuthParameters,
};
