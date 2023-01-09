import { Meta, StoryFn } from '@storybook/react';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { Normal as VisitorOnlyLayoutNormalStory } from '@mediature/main/src/app/(visitor-only)/VisitorOnlyLayout.stories';
import { Empty as SignInFormEmptyStory } from '@mediature/main/src/app/(visitor-only)/auth/sign-in/SignInForm.stories';
import { SignInPage, SignInPageContext } from '@mediature/main/src/app/(visitor-only)/auth/sign-in/SignInPage';

const { generateMetaDefault, prepareStory } = StoryHelperFactory<typeof SignInPage>();

export default {
  title: 'Pages/SignIn',
  component: SignInPage,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<typeof SignInPage>;

const Template: StoryFn<typeof SignInPage> = (args) => {
  return <SignInPage />;
};

const NormalStory = Template.bind({});
NormalStory.args = {};

export const Normal = prepareStory(NormalStory, {
  childrenContext: {
    context: SignInPageContext,
    value: {
      ContextualSignInForm: SignInFormEmptyStory,
    },
  },
});

const WithLayoutStory = Template.bind({});
WithLayoutStory.args = {};

export const WithLayout = prepareStory(WithLayoutStory, {
  layoutStory: VisitorOnlyLayoutNormalStory,
  childrenContext: {
    context: SignInPageContext,
    value: {
      ContextualSignInForm: SignInFormEmptyStory,
    },
  },
});
