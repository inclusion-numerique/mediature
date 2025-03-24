import { Meta, StoryFn } from '@storybook/react';
import { within } from '@storybook/test';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { InvitationList } from '@mediature/main/src/components/InvitationList';
import { invitations } from '@mediature/main/src/fixtures/invitation';
import { getTRPCMock } from '@mediature/main/src/server/mock/trpc';

type ComponentType = typeof InvitationList;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Components/InvitationList',
  component: InvitationList,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

const defaultMswParameters = {
  msw: {
    handlers: [
      getTRPCMock({
        type: 'mutation',
        path: ['cancelInvitation'],
        response: undefined,
      }),
    ],
  },
};

const Template: StoryFn<ComponentType> = (args) => {
  return <InvitationList {...args} />;
};

const NormalStory = Template.bind({});
NormalStory.args = {
  invitations: invitations,
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
