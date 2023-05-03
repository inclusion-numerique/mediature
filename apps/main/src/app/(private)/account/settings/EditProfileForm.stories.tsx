import { generateMock } from '@anatine/zod-mock';
import { Meta, StoryFn } from '@storybook/react';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { playFindForm } from '@mediature/docs/.storybook/testing';
import { EditProfileForm } from '@mediature/main/src/app/(private)/account/settings/EditProfileForm';
import { users } from '@mediature/main/src/fixtures/user';
import { UpdateProfilePrefillSchema } from '@mediature/main/src/models/actions/user';
import { UserSchema } from '@mediature/main/src/models/entities/user';
import { getTRPCMock } from '@mediature/main/src/server/mock/trpc';

type ComponentType = typeof EditProfileForm;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Forms/EditProfile',
  component: EditProfileForm,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

const defaultMswParameters = {
  msw: {
    handlers: [
      getTRPCMock({
        type: 'mutation',
        path: ['updateProfile'],
        response: { user: users[0] },
      }),
    ],
  },
};

const Template: StoryFn<ComponentType> = (args) => {
  return <EditProfileForm {...args} />;
};

const EmptyStory = Template.bind({});
EmptyStory.args = {
  email: users[0].email,
  prefill: UpdateProfilePrefillSchema.parse({}),
};
EmptyStory.parameters = { ...defaultMswParameters };
EmptyStory.play = async ({ canvasElement }) => {
  await playFindForm(canvasElement);
};

export const Empty = prepareStory(EmptyStory);

const FilledStory = Template.bind({});
FilledStory.args = {
  email: users[0].email,
  prefill: UpdateProfilePrefillSchema.parse({
    firstname: users[0].firstname,
    lastname: users[0].lastname,
  }),
};
FilledStory.parameters = { ...defaultMswParameters };
FilledStory.play = async ({ canvasElement }) => {
  await playFindForm(canvasElement);
};

export const Filled = prepareStory(FilledStory);
