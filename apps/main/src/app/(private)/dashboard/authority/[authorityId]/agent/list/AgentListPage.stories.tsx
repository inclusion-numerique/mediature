import { Meta, StoryFn } from '@storybook/react';

import { userSessionContext } from '@mediature/docs/.storybook/auth';
import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { playFindMainTitle } from '@mediature/docs/.storybook/testing';
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

const commonNextParamsParameters = {
  params: {
    authorityId: 'b79cb3ba-745e-5d9a-8903-4a02327a7e01',
  },
};

async function playFindTitle(canvasElement: HTMLElement): Promise<HTMLElement> {
  return await playFindMainTitle(canvasElement, /médiateurs/i);
}

const Template: StoryFn<typeof AgentListPage> = (args) => {
  return <AgentListPage {...args} />;
};

const NormalStory = Template.bind({});
NormalStory.args = {
  ...commonNextParamsParameters,
};
NormalStory.parameters = {
  ...defaultMswParameters,
};
NormalStory.play = async ({ canvasElement }) => {
  await playFindTitle(canvasElement);
};

export const Normal = prepareStory(NormalStory, {});

const WithLayoutStory = Template.bind({});
WithLayoutStory.args = {
  ...commonNextParamsParameters,
};
WithLayoutStory.parameters = {
  layout: 'fullscreen',
  ...defaultMswParameters,
};
WithLayoutStory.play = async ({ canvasElement }) => {
  await playFindTitle(canvasElement);
};

export const WithLayout = prepareStory(WithLayoutStory, {
  layoutStory: PrivateLayoutNormalStory,
});
