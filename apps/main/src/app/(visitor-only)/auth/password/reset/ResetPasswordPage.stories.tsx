import { Meta, StoryFn } from '@storybook/react';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { playFindForm, playFindFormInMain } from '@mediature/docs/.storybook/testing';
import { Normal as VisitorOnlyLayoutNormalStory } from '@mediature/main/src/app/(visitor-only)/VisitorOnlyLayout.stories';
import { Empty as ResetPasswordFormEmptyStory } from '@mediature/main/src/app/(visitor-only)/auth/password/reset/ResetPasswordForm.stories';
import { ResetPasswordPage, ResetPasswordPageContext } from '@mediature/main/src/app/(visitor-only)/auth/password/reset/ResetPasswordPage';

type ComponentType = typeof ResetPasswordPage;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Pages/ResetPassword',
  component: ResetPasswordPage,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

const Template: StoryFn<ComponentType> = (args) => {
  return <ResetPasswordPage />;
};

const NormalStory = Template.bind({});
NormalStory.args = {};
NormalStory.play = async ({ canvasElement }) => {
  await playFindForm(canvasElement);
};

export const Normal = prepareStory(NormalStory, {
  childrenContext: {
    context: ResetPasswordPageContext,
    value: {
      ContextualResetPasswordForm: ResetPasswordFormEmptyStory,
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
    context: ResetPasswordPageContext,
    value: {
      ContextualResetPasswordForm: ResetPasswordFormEmptyStory,
    },
  },
});
