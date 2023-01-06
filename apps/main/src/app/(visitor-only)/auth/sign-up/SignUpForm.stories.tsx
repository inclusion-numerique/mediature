import { generateMock } from '@anatine/zod-mock';
import { Meta, StoryFn } from '@storybook/react';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { SignUpForm } from '@mediature/main/src/app/(visitor-only)/auth/sign-up/SignUpForm';
import { SignUpPrefillSchema } from '@mediature/main/src/models/actions/auth';
import { UserSchema } from '@mediature/main/src/models/entities/user';
import { getTRPCMock } from '@mediature/main/src/server/mock/trpc';

const { generateMetaDefault, prepareStory } = StoryHelperFactory<typeof SignUpForm>();

export default {
  title: 'Forms/SignUp',
  component: SignUpForm,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<typeof SignUpForm>;

const defaultMswParameters = {
  msw: {
    handlers: [
      getTRPCMock({
        type: 'mutation',
        path: ['signUp'],
        response: {
          createdUser: generateMock(UserSchema),
        },
      }),
    ],
  },
};

const Template: StoryFn<typeof SignUpForm> = (args) => {
  return <SignUpForm {...args} />;
};

const EmptyStory = Template.bind({});
EmptyStory.args = {
  prefill: SignUpPrefillSchema.parse({
    invitationToken: 'abc',
  }),
};
EmptyStory.parameters = { ...defaultMswParameters };

export const Empty = prepareStory(EmptyStory);

const FilledStory = Template.bind({});
FilledStory.args = {
  prefill: SignUpPrefillSchema.parse({
    invitationToken: 'abc',
    email: 'jean@france.fr',
    password: 'mypassword',
    firstname: 'Jean',
    lastname: 'Derrien',
    termsAccepted: true,
  }),
};
FilledStory.parameters = { ...defaultMswParameters };

export const Filled = prepareStory(FilledStory);
