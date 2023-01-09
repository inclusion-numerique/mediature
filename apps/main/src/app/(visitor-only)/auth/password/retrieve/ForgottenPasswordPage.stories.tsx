import { Meta, StoryFn } from '@storybook/react';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { Normal as VisitorOnlyLayoutNormalStory } from '@mediature/main/src/app/(visitor-only)/VisitorOnlyLayout.stories';
import {
  ForgottenPasswordPage,
  ForgottenPasswordPageContext,
} from '@mediature/main/src/app/(visitor-only)/auth/password/retrieve/ForgottenPasswordPage';
import { Empty as RetrievePasswordFormEmptyStory } from '@mediature/main/src/app/(visitor-only)/auth/password/retrieve/RetrievePasswordForm.stories';

const { generateMetaDefault, prepareStory } = StoryHelperFactory<typeof ForgottenPasswordPage>();

export default {
  title: 'Pages/ForgottenPassword',
  component: ForgottenPasswordPage,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<typeof ForgottenPasswordPage>;

const Template: StoryFn<typeof ForgottenPasswordPage> = (args) => {
  return <ForgottenPasswordPage />;
};

const NormalStory = Template.bind({});
NormalStory.args = {};

export const Normal = prepareStory(NormalStory, {
  childrenContext: {
    context: ForgottenPasswordPageContext,
    value: {
      ContextualRetrievePasswordForm: RetrievePasswordFormEmptyStory,
    },
  },
});

const WithLayoutStory = Template.bind({});
WithLayoutStory.args = {};

export const WithLayout = prepareStory(WithLayoutStory, {
  layoutStory: VisitorOnlyLayoutNormalStory,
  childrenContext: {
    context: ForgottenPasswordPageContext,
    value: {
      ContextualRetrievePasswordForm: RetrievePasswordFormEmptyStory,
    },
  },
});
