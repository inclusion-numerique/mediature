import { Meta, StoryFn } from '@storybook/react';

import { ComponentProps, StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { playFindForm, playFindFormInMain } from '@mediature/docs/.storybook/testing';
import { AsAdmin as PrivateLayoutAsAdminStory } from '@mediature/main/src/app/(private)/PrivateLayout.stories';
import {
  AuthorityEditPage,
  AuthorityEditPageContext,
} from '@mediature/main/src/app/(private)/dashboard/authority/[authorityId]/edit/AuthorityEditPage';
import { Empty as EditAuthorityFormEmptyStory } from '@mediature/main/src/app/(private)/dashboard/authority/[authorityId]/edit/EditAuthorityForm.stories';
import { authorities } from '@mediature/main/src/fixtures/authority';
import { AuthoritySchema } from '@mediature/main/src/models/entities/authority';
import { getTRPCMock } from '@mediature/main/src/server/mock/trpc';

type ComponentType = typeof AuthorityEditPage;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Pages/EditAuthority',
  component: AuthorityEditPage,
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
  return <AuthorityEditPage {...args} />;
};

const NormalStory = Template.bind({});
NormalStory.args = {
  ...commonComponentProps,
};
NormalStory.parameters = {
  ...defaultMswParameters,
};
NormalStory.play = async ({ canvasElement }) => {
  await playFindForm(canvasElement);
};

export const Normal = prepareStory(NormalStory, {
  childrenContext: {
    context: AuthorityEditPageContext,
    value: {
      ContextualEditAuthorityForm: EditAuthorityFormEmptyStory,
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
  layoutStory: PrivateLayoutAsAdminStory,
  childrenContext: {
    context: AuthorityEditPageContext,
    value: {
      ContextualEditAuthorityForm: EditAuthorityFormEmptyStory,
    },
  },
});
