import { Meta, StoryFn } from '@storybook/react';
import { within } from '@storybook/testing-library';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { AdminList } from '@mediature/main/src/components/AdminList';
import { admins } from '@mediature/main/src/fixtures/admin';
import { getTRPCMock } from '@mediature/main/src/server/mock/trpc';

type ComponentType = typeof AdminList;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Components/AdminList',
  component: AdminList,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

const defaultMswParameters = {
  msw: {
    handlers: [
      getTRPCMock({
        type: 'mutation',
        path: ['revokeAdmin'],
        response: undefined,
      }),
    ],
  },
};

const Template: StoryFn<ComponentType> = (args) => {
  return <AdminList {...args} />;
};

const NormalStory = Template.bind({});
NormalStory.args = {
  admins: admins,
};
NormalStory.parameters = {
  ...defaultMswParameters,
};
NormalStory.play = async ({ canvasElement }) => {
  await within(canvasElement).findByRole('grid', {
    name: /liste/i,
  });
};

export const Normal = prepareStory(NormalStory);
