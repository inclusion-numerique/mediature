import { Meta, StoryFn } from '@storybook/react';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { playFindForm } from '@mediature/docs/.storybook/testing';
import { InviteAgentForm } from '@mediature/main/src/app/(private)/dashboard/authority/[authorityId]/agent/add/InviteAgentForm';
import { InviteAgentPrefillSchema } from '@mediature/main/src/models/actions/agent';
import { getTRPCMock } from '@mediature/main/src/server/mock/trpc';

const { generateMetaDefault, prepareStory } = StoryHelperFactory<typeof InviteAgentForm>();

export default {
  title: 'Forms/InviteAgent',
  component: InviteAgentForm,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<typeof InviteAgentForm>;

const defaultMswParameters = {
  msw: {
    handlers: [
      getTRPCMock({
        type: 'mutation',
        path: ['inviteAgent'],
        response: undefined,
      }),
    ],
  },
};

const Template: StoryFn<typeof InviteAgentForm> = (args) => {
  return <InviteAgentForm {...args} />;
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
  prefill: InviteAgentPrefillSchema.parse({
    authorityId: '00000000-0000-0000-0000-000000000000',
    inviteeEmail: 'jean@france.fr',
    inviteeFirstname: 'Jean',
    inviteeLastname: 'Derrien',
  }),
};
FilledStory.parameters = { ...defaultMswParameters };
FilledStory.play = async ({ canvasElement }) => {
  await playFindForm(canvasElement);
};

export const Filled = prepareStory(FilledStory);
