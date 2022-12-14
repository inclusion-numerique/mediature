import { Meta, StoryFn } from '@storybook/react';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { Normal as PrivateLayoutNormalStory } from '@mediature/main/src/app/(private)/PrivateLayout.stories';
import {
  AuthorityCreationPage,
  AuthorityCreationPageContext,
} from '@mediature/main/src/app/(private)/dashboard/authority/create/AuthorityCreationPage';
import { Empty as CreateAuthorityFormEmptyStory } from '@mediature/main/src/app/(private)/dashboard/authority/create/CreateAuthorityForm.stories';

const { generateMetaDefault, prepareStory } = StoryHelperFactory<typeof AuthorityCreationPage>();

export default {
  title: 'Pages/CreateAuthority',
  component: AuthorityCreationPage,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<typeof AuthorityCreationPage>;

const Template: StoryFn<typeof AuthorityCreationPage> = (args) => {
  return <AuthorityCreationPage />;
};

const NormalStory = Template.bind({});
NormalStory.args = {};

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

export const WithLayout = prepareStory(WithLayoutStory, {
  layoutStory: PrivateLayoutNormalStory,
  childrenContext: {
    context: AuthorityCreationPageContext,
    value: {
      ContextualCreateAuthorityForm: CreateAuthorityFormEmptyStory,
    },
  },
});
