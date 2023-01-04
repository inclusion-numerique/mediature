import { Meta, StoryFn } from '@storybook/react';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { SignInForm } from '@mediature/main/app/(visitor-only)/auth/sign-in/SignInForm';
import { SignInPrefillSchema } from '@mediature/main/models/actions/auth';

const { generateMetaDefault, prepareStory } = StoryHelperFactory<typeof SignInForm>();

export default {
  title: 'Forms/SignIn',
  component: SignInForm,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<typeof SignInForm>;

const Template: StoryFn<typeof SignInForm> = (args) => {
  return <SignInForm {...args} />;
};

const EmptyStory = Template.bind({});
EmptyStory.args = {};

export const Empty = prepareStory(EmptyStory);

const FilledStory = Template.bind({});
FilledStory.args = {
  prefill: SignInPrefillSchema.parse({
    email: 'jean@france.fr',
    password: 'mypassword',
    rememberMe: true,
  }),
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

export const LoggedOut = prepareStory(LoggedOutStory);
