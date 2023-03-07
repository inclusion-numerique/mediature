import { Meta, StoryFn } from '@storybook/react';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { ChangePasswordForm } from '@mediature/main/src/app/(private)/account/settings/ChangePasswordForm';
import { ChangePasswordPrefillSchema } from '@mediature/main/src/models/actions/auth';
import { getTRPCMock } from '@mediature/main/src/server/mock/trpc';

type ComponentType = typeof ChangePasswordForm;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Forms/ChangePassword',
  component: ChangePasswordForm,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

const defaultMswParameters = {
  msw: {
    handlers: [
      getTRPCMock({
        type: 'mutation',
        path: ['changePassword'],
        response: undefined,
      }),
    ],
  },
};

const Template: StoryFn<ComponentType> = (args) => {
  return <ChangePasswordForm {...args} />;
};

const EmptyStory = Template.bind({});
EmptyStory.args = {
  prefill: ChangePasswordPrefillSchema.parse({}),
};
EmptyStory.parameters = { ...defaultMswParameters };

export const Empty = prepareStory(EmptyStory);

const FilledStory = Template.bind({});
FilledStory.args = {
  prefill: ChangePasswordPrefillSchema.parse({
    currentPassword: 'my-current-password',
    newPassword: 'my-new-password',
  }),
};
FilledStory.parameters = { ...defaultMswParameters };

export const Filled = prepareStory(FilledStory);
