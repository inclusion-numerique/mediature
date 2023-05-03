import { Meta, StoryFn } from '@storybook/react';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { playFindForm, playFindFormInMain } from '@mediature/docs/.storybook/testing';
import { Normal as VisitorOnlyLayoutNormalStory } from '@mediature/main/src/app/(visitor-only)/VisitorOnlyLayout.stories';
import { Empty as SignInFormEmptyStory } from '@mediature/main/src/app/(visitor-only)/auth/sign-in/SignInForm.stories';
import { SignInPage, SignInPageContext } from '@mediature/main/src/app/(visitor-only)/auth/sign-in/SignInPage';

type ComponentType = typeof SignInPage;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Pages/SignIn',
  component: SignInPage,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

const Template: StoryFn<ComponentType> = (args) => {
  return <SignInPage />;
};

const NormalStory = Template.bind({});
NormalStory.args = {};
NormalStory.play = async ({ canvasElement }) => {
  await playFindForm(canvasElement);
};

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
WithLayoutStory.parameters = {
  layout: 'fullscreen',
};
WithLayoutStory.play = async ({ canvasElement }) => {
  await playFindFormInMain(canvasElement);
};

export const WithLayout = prepareStory(WithLayoutStory, {
  layoutStory: VisitorOnlyLayoutNormalStory,
  childrenContext: {
    context: SignInPageContext,
    value: {
      ContextualSignInForm: SignInFormEmptyStory,
    },
  },
});
