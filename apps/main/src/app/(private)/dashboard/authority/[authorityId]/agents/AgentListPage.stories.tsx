import { Meta, StoryFn } from '@storybook/react';

import { ComponentProps, StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { playFindMainTitle } from '@mediature/docs/.storybook/testing';
import { AsMainAgent as PrivateLayoutAsMainAgentStory } from '@mediature/main/src/app/(private)/PrivateLayout.stories';
import { AgentListPage } from '@mediature/main/src/app/(private)/dashboard/authority/[authorityId]/agents/AgentListPage';
import { agentsWrappers } from '@mediature/main/src/fixtures/agent';
import { invitations } from '@mediature/main/src/fixtures/invitation';
import { getTRPCMock } from '@mediature/main/src/server/mock/trpc';

type ComponentType = typeof AgentListPage;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Pages/AgentList',
  component: AgentListPage,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

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
        type: 'query',
        path: ['listAgentInvitations'],
        response: {
          invitations: [invitations[0], invitations[1], invitations[2]],
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

const commonComponentProps: ComponentProps<ComponentType> = {
  params: {
    authorityId: 'b79cb3ba-745e-5d9a-8903-4a02327a7e01',
  },
};

async function playFindTitle(canvasElement: HTMLElement): Promise<HTMLElement> {
  return await playFindMainTitle(canvasElement, /médiateurs/i);
}

const Template: StoryFn<ComponentType> = (args) => {
  return <AgentListPage {...args} />;
};

const NormalStory = Template.bind({});
NormalStory.args = {
  ...commonComponentProps,
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
  ...commonComponentProps,
};
WithLayoutStory.parameters = {
  layout: 'fullscreen',
  ...defaultMswParameters,
};
WithLayoutStory.play = async ({ canvasElement }) => {
  await playFindTitle(canvasElement);
};

export const WithLayout = prepareStory(WithLayoutStory, {
  layoutStory: PrivateLayoutAsMainAgentStory,
});
