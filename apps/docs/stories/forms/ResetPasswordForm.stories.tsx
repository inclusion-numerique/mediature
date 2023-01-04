import { Meta, StoryFn } from '@storybook/react';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { ResetPasswordForm } from '@mediature/main/app/(visitor-only)/auth/password/reset/ResetPasswordForm';
import { ResetPasswordPrefillSchema } from '@mediature/main/models/actions/auth';
import { getTRPCMock } from '@mediature/main/server/mock/trpc';

const { generateMetaDefault, prepareStory } = StoryHelperFactory<typeof ResetPasswordForm>();

export default {
  title: 'Forms/ResetPassword',
  component: ResetPasswordForm,
  ...generateMetaDefault({
    parameters: {
      msw: {
        handlers: [
          getTRPCMock({
            type: 'mutation',
            path: ['resetPassword'],
            response: undefined,
          }),
        ],
      },
    },
  }),
} as Meta<typeof ResetPasswordForm>;

const Template: StoryFn<typeof ResetPasswordForm> = (args) => {
  return <ResetPasswordForm {...args} />;
};

const EmptyStory = Template.bind({});
EmptyStory.args = {};

export const Empty = prepareStory(EmptyStory);

const FilledStory = Template.bind({});
FilledStory.args = {
  prefill: ResetPasswordPrefillSchema.parse({
    token: 'sunt-aut-quod',
    password: 'mypassword',
  }),
};

export const Filled = prepareStory(FilledStory);
