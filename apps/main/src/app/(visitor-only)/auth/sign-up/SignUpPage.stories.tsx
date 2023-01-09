import { Meta, StoryFn } from '@storybook/react';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { Normal as VisitorOnlyLayoutNormalStory } from '@mediature/main/src/app/(visitor-only)/VisitorOnlyLayout.stories';
import { Empty as SignUpFormEmptyStory } from '@mediature/main/src/app/(visitor-only)/auth/sign-up/SignUpForm.stories';
import { SignUpPage, SignUpPageContext } from '@mediature/main/src/app/(visitor-only)/auth/sign-up/SignUpPage';

const { generateMetaDefault, prepareStory } = StoryHelperFactory<typeof SignUpPage>();

export default {
  title: 'Pages/SignUp',
  component: SignUpPage,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<typeof SignUpPage>;

const tokenProvidedParameters = {
  nextjs: {
    navigation: {
      query: {
        token: 'abc',
      },
    },
  },
};

const Template: StoryFn<typeof SignUpPage> = (args) => {
  return <SignUpPage />;
};

const NormalStory = Template.bind({});
NormalStory.args = {};
NormalStory.parameters = { ...tokenProvidedParameters };

export const Normal = prepareStory(NormalStory, {
  childrenContext: {
    context: SignUpPageContext,
    value: {
      ContextualSignUpForm: SignUpFormEmptyStory,
    },
  },
});

const MissingInvitationTokenStory = Template.bind({});
MissingInvitationTokenStory.args = {};
MissingInvitationTokenStory.parameters = {};

export const MissingInvitationToken = prepareStory(MissingInvitationTokenStory, {
  childrenContext: {
    context: SignUpPageContext,
    value: {
      ContextualSignUpForm: SignUpFormEmptyStory,
    },
  },
});

const WithLayoutStory = Template.bind({});
WithLayoutStory.args = {};
WithLayoutStory.parameters = { ...tokenProvidedParameters };

export const WithLayout = prepareStory(WithLayoutStory, {
  layoutStory: VisitorOnlyLayoutNormalStory,
  childrenContext: {
    context: SignUpPageContext,
    value: {
      ContextualSignUpForm: SignUpFormEmptyStory,
    },
  },
});
