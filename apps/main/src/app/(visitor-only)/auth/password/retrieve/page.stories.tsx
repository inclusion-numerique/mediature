import { Meta, StoryFn } from '@storybook/react';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { Empty as RetrievePasswordFormEmptyStory } from '@mediature/main/src/app/(visitor-only)/auth/password/retrieve/RetrievePasswordForm.stories';
import { ForgotPasswordPage, ForgotPasswordPageContext } from '@mediature/main/src/app/(visitor-only)/auth/password/retrieve/page';
import { Normal as VisitorOnlyLayoutNormalStory } from '@mediature/main/src/app/(visitor-only)/layout.stories';

const { generateMetaDefault, prepareStory } = StoryHelperFactory<typeof ForgotPasswordPage>();

export default {
  title: 'Pages/ForgotPassword',
  component: ForgotPasswordPage,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<typeof ForgotPasswordPage>;

const Template: StoryFn<typeof ForgotPasswordPage> = (args) => {
  return <ForgotPasswordPage />;
};

const NormalStory = Template.bind({});
NormalStory.args = {};

export const Normal = prepareStory(NormalStory, {
  childrenContext: {
    context: ForgotPasswordPageContext,
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
    context: ForgotPasswordPageContext,
    value: {
      ContextualRetrievePasswordForm: RetrievePasswordFormEmptyStory,
    },
  },
});
