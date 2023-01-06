import { Meta, StoryFn } from '@storybook/react';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { Empty as CreateAuthorityFormEmptyStory } from '@mediature/main/src/app/(private)/dashboard/authority/create/CreateAuthorityForm.stories';
import { CreateAuthorityPage, CreateAuthorityPageContext } from '@mediature/main/src/app/(private)/dashboard/authority/create/page';
import { Normal as PrivateLayoutNormalStory } from '@mediature/main/src/app/(private)/layout.stories';

const { generateMetaDefault, prepareStory } = StoryHelperFactory<typeof CreateAuthorityPage>();

export default {
  title: 'Pages/CreateAuthority',
  component: CreateAuthorityPage,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<typeof CreateAuthorityPage>;

const Template: StoryFn<typeof CreateAuthorityPage> = (args) => {
  return <CreateAuthorityPage />;
};

const NormalStory = Template.bind({});
NormalStory.args = {};

export const Normal = prepareStory(NormalStory, {
  childrenContext: {
    context: CreateAuthorityPageContext,
    value: {
      ContextualCreateAuthorityForm: CreateAuthorityFormEmptyStory,
    },
  },
});

const WithLayoutStory = Template.bind({});
WithLayoutStory.args = {};

export const WithLayout = prepareStory(WithLayoutStory, {
  layoutStory: PrivateLayoutNormalStory,
  childrenContext: {
    context: CreateAuthorityPageContext,
    value: {
      ContextualCreateAuthorityForm: CreateAuthorityFormEmptyStory,
    },
  },
});
