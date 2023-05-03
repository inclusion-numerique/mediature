import { Meta, StoryFn } from '@storybook/react';

import { ComponentProps, StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { playFindAlert, playFindForm, playFindFormInMain } from '@mediature/docs/.storybook/testing';
import { AddAgentPage, AddAgentPageContext } from '@mediature/main/src/app/(private)/dashboard/authority/[authorityId]/agent/add/AddAgentPage';
import { Empty as InviteAgentFormEmptyStory } from '@mediature/main/src/app/(private)/dashboard/authority/[authorityId]/agent/add/InviteAgentForm.stories';
import { Normal as VisitorOnlyLayoutNormalStory } from '@mediature/main/src/app/(visitor-only)/VisitorOnlyLayout.stories';
import { authorities } from '@mediature/main/src/fixtures/authority';
import { AuthoritySchema } from '@mediature/main/src/models/entities/authority';
import { getTRPCMock } from '@mediature/main/src/server/mock/trpc';

type ComponentType = typeof AddAgentPage;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Pages/AddAgent',
  component: AddAgentPage,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

const defaultMswParameters = {
  msw: {
    handlers: [
      getTRPCMock({
        type: 'query',
        path: ['getAuthority'],
        response: {
          authority: AuthoritySchema.parse(authorities[0]),
        },
      }),
    ],
  },
};

const commonComponentProps: ComponentProps<ComponentType> = {
  params: {
    authorityId: 'b79cb3ba-745e-5d9a-8903-4a02327a7e01',
  },
};

const Template: StoryFn<ComponentType> = (args) => {
  return <AddAgentPage {...args} />;
};

const NormalStory = Template.bind({});
NormalStory.args = {
  ...commonComponentProps,
};
NormalStory.parameters = { ...defaultMswParameters };
NormalStory.play = async ({ canvasElement }) => {
  await playFindForm(canvasElement);
};

export const Normal = prepareStory(NormalStory, {
  childrenContext: {
    context: AddAgentPageContext,
    value: {
      ContextualInviteAgentForm: InviteAgentFormEmptyStory,
    },
  },
});

const NotFoundStory = Template.bind({});
NotFoundStory.args = {
  ...commonComponentProps,
};
NotFoundStory.parameters = {
  msw: {
    handlers: [
      getTRPCMock({
        type: 'query',
        path: ['getAuthority'],
        response: null as any, // TODO: manage the case when an error of "not found" should be sent
      }),
    ],
  },
};
NotFoundStory.play = async ({ canvasElement }) => {
  await playFindAlert(canvasElement);
};

export const NotFound = prepareStory(NotFoundStory, {
  childrenContext: {
    context: AddAgentPageContext,
    value: {
      ContextualInviteAgentForm: InviteAgentFormEmptyStory,
    },
  },
});

const WithLayoutStory = Template.bind({});
WithLayoutStory.args = {
  ...commonComponentProps,
};
WithLayoutStory.parameters = {
  layout: 'fullscreen',
  ...defaultMswParameters,
};
WithLayoutStory.play = async ({ canvasElement }) => {
  await playFindFormInMain(canvasElement);
};

export const WithLayout = prepareStory(WithLayoutStory, {
  layoutStory: VisitorOnlyLayoutNormalStory,
  childrenContext: {
    context: AddAgentPageContext,
    value: {
      ContextualInviteAgentForm: InviteAgentFormEmptyStory,
    },
  },
});
