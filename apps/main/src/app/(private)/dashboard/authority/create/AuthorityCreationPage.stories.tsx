import { Meta, StoryFn } from '@storybook/react';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { playFindForm, playFindFormInMain } from '@mediature/docs/.storybook/testing';
import { AsAdmin as PrivateLayoutAsAdminStory } from '@mediature/main/src/app/(private)/PrivateLayout.stories';
import {
  AuthorityCreationPage,
  AuthorityCreationPageContext,
} from '@mediature/main/src/app/(private)/dashboard/authority/create/AuthorityCreationPage';
import { Empty as CreateAuthorityFormEmptyStory } from '@mediature/main/src/app/(private)/dashboard/authority/create/CreateAuthorityForm.stories';

type ComponentType = typeof AuthorityCreationPage;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Pages/CreateAuthority',
  component: AuthorityCreationPage,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

const Template: StoryFn<ComponentType> = (args) => {
  return <AuthorityCreationPage />;
};

const NormalStory = Template.bind({});
NormalStory.args = {};
NormalStory.play = async ({ canvasElement }) => {
  await playFindForm(canvasElement);
};

export const Normal = prepareStory(NormalStory, {
  childrenContext: {
    context: AuthorityCreationPageContext,
    value: {
      ContextualCreateAuthorityForm: CreateAuthorityFormEmptyStory,
    },
  },
});

const WithLayoutStory = Template.bind({});
WithLayoutStory.args = {};
WithLayoutStory.parameters = {
  layout: 'fullscreen',
};
WithLayoutStory.play = async ({ canvasElement }) => {
  await playFindFormInMain(canvasElement);
};

export const WithLayout = prepareStory(WithLayoutStory, {
  layoutStory: PrivateLayoutAsAdminStory,
  childrenContext: {
    context: AuthorityCreationPageContext,
    value: {
      ContextualCreateAuthorityForm: CreateAuthorityFormEmptyStory,
    },
  },
});
