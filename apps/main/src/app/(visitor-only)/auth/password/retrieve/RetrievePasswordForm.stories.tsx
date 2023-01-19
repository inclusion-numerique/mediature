import { Meta, StoryFn } from '@storybook/react';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { playFindForm } from '@mediature/docs/.storybook/testing';
import { RetrievePasswordForm } from '@mediature/main/src/app/(visitor-only)/auth/password/retrieve/RetrievePasswordForm';
import { RequestNewPasswordPrefillSchema } from '@mediature/main/src/models/actions/auth';
import { getTRPCMock } from '@mediature/main/src/server/mock/trpc';

const { generateMetaDefault, prepareStory } = StoryHelperFactory<typeof RetrievePasswordForm>();

export default {
  title: 'Forms/RetrievePassword',
  component: RetrievePasswordForm,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<typeof RetrievePasswordForm>;

const defaultMswParameters = {
  msw: {
    handlers: [
      getTRPCMock({
        type: 'mutation',
        path: ['requestNewPassword'],
        response: undefined,
      }),
    ],
  },
};

const Template: StoryFn<typeof RetrievePasswordForm> = (args) => {
  return <RetrievePasswordForm {...args} />;
};

const EmptyStory = Template.bind({});
EmptyStory.args = {};
EmptyStory.parameters = { ...defaultMswParameters };
EmptyStory.play = async ({ canvasElement }) => {
  await playFindForm(canvasElement);
};

export const Empty = prepareStory(EmptyStory);

const FilledStory = Template.bind({});
FilledStory.args = {
  prefill: RequestNewPasswordPrefillSchema.parse({
    email: 'jean@france.fr',
  }),
};
FilledStory.parameters = { ...defaultMswParameters };
FilledStory.play = async ({ canvasElement }) => {
  await playFindForm(canvasElement);
};

export const Filled = prepareStory(FilledStory);
