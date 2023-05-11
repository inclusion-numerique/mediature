import { Meta, StoryFn } from '@storybook/react';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { playFindForm } from '@mediature/docs/.storybook/testing';
import { SignInForm } from '@mediature/main/src/app/(visitor-only)/auth/sign-in/SignInForm';
import { SignInPrefillSchema } from '@mediature/main/src/models/actions/auth';

type ComponentType = typeof SignInForm;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Forms/SignIn',
  component: SignInForm,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

const Template: StoryFn<ComponentType> = (args) => {
  return <SignInForm {...args} />;
};

const EmptyStory = Template.bind({});
EmptyStory.args = {};
EmptyStory.play = async ({ canvasElement }) => {
  await playFindForm(canvasElement);
};

export const Empty = prepareStory(EmptyStory);

export const FilledStory = Template.bind({});
FilledStory.args = {
  prefill: SignInPrefillSchema.parse({
    email: 'jean@france.fr',
    password: 'Mypassword@1',
    rememberMe: true,
  }),
};
FilledStory.play = async ({ canvasElement }) => {
  await playFindForm(canvasElement);
};

export const Filled = prepareStory(FilledStory);

const LoggedOutStory = Template.bind({});
LoggedOutStory.parameters = {
  nextjs: {
    navigation: {
      query: {
        session_end: true,
      },
    },
  },
};
LoggedOutStory.args = {};
LoggedOutStory.play = async ({ canvasElement }) => {
  await playFindForm(canvasElement);
};

export const LoggedOut = prepareStory(LoggedOutStory);

const JustRegisteredStory = Template.bind({});
JustRegisteredStory.parameters = {
  nextjs: {
    navigation: {
      query: {
        registered: true,
      },
    },
  },
};
JustRegisteredStory.args = {};
JustRegisteredStory.play = async ({ canvasElement }) => {
  await playFindForm(canvasElement);
};

export const JustRegistered = prepareStory(JustRegisteredStory);
