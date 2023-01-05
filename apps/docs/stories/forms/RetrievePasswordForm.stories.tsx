import { Meta, StoryFn } from '@storybook/react';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { RetrievePasswordForm } from '@mediature/main/src/app/(visitor-only)/auth/password/retrieve/RetrievePasswordForm';
import { RequestNewPasswordPrefillSchema } from '@mediature/main/src/models/actions/auth';
import { getTRPCMock } from '@mediature/main/src/server/mock/trpc';

const { generateMetaDefault, prepareStory } = StoryHelperFactory<typeof RetrievePasswordForm>();

export default {
  title: 'Forms/RetrievePassword',
  component: RetrievePasswordForm,
  ...generateMetaDefault({
    parameters: {
      msw: {
        handlers: [
          getTRPCMock({
            type: 'mutation',
            path: ['requestNewPassword'],
            response: undefined,
          }),
        ],
      },
    },
  }),
} as Meta<typeof RetrievePasswordForm>;

const Template: StoryFn<typeof RetrievePasswordForm> = (args) => {
  return <RetrievePasswordForm {...args} />;
};

const EmptyStory = Template.bind({});
EmptyStory.args = {};

export const Empty = prepareStory(EmptyStory);

const FilledStory = Template.bind({});
FilledStory.args = {
  prefill: RequestNewPasswordPrefillSchema.parse({
    email: 'jean@france.fr',
  }),
};

export const Filled = prepareStory(FilledStory);
