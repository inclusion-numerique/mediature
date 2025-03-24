import { Meta, StoryFn } from '@storybook/react';
import { within } from '@storybook/test';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { playFindAlert } from '@mediature/docs/.storybook/testing';
import { reusableNormal as MessengerSenderNormalStory } from '@mediature/main/src/components/messenger/MessengerSender.stories';
import { MessengerViewer, MessengerViewerContext } from '@mediature/main/src/components/messenger/MessengerViewer';
import { messages } from '@mediature/main/src/fixtures/messenger';
import { MessageErrorSchema } from '@mediature/main/src/models/entities/messenger';
import { getTRPCMock } from '@mediature/main/src/server/mock/trpc';

type ComponentType = typeof MessengerViewer;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Components/MessengerViewer',
  component: MessengerViewer,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

const defaultMswParameters = {
  msw: {
    handlers: [
      getTRPCMock({
        type: 'mutation',
        path: ['updateMessageMetadata'],
        response: undefined,
      }),
    ],
  },
};

const Template: StoryFn<ComponentType> = (args) => {
  return <MessengerViewer {...args} />;
};

const ReceivedMessageStory = Template.bind({});
ReceivedMessageStory.args = {
  caseId: 'b79cb3ba-745e-5d9a-8903-4a02327a7e01',
  message: { ...messages[0], consideredAsProcessed: true },
};
ReceivedMessageStory.parameters = { ...defaultMswParameters };
ReceivedMessageStory.play = async ({ canvasElement }) => {
  await within(canvasElement).findByRole('button', {
    name: /répondre/i,
  });
};

export const ReceivedMessage = prepareStory(ReceivedMessageStory, {
  childrenContext: {
    context: MessengerViewerContext,
    value: {
      ContextualMessengerSender: MessengerSenderNormalStory,
    },
  },
});

const ReceivedMessageWithErrorStory = Template.bind({});
ReceivedMessageWithErrorStory.args = {
  caseId: 'b79cb3ba-745e-5d9a-8903-4a02327a7e01',
  message: { ...messages[0], errors: [MessageErrorSchema.Values.REJECTED_ATTACHMENTS] },
};
ReceivedMessageWithErrorStory.parameters = { ...defaultMswParameters };
ReceivedMessageWithErrorStory.play = async ({ canvasElement }) => {
  await playFindAlert(canvasElement);
};

export const ReceivedMessageWithError = prepareStory(ReceivedMessageWithErrorStory, {
  childrenContext: {
    context: MessengerViewerContext,
    value: {
      ContextualMessengerSender: MessengerSenderNormalStory,
    },
  },
});

const SentMessageStory = Template.bind({});
SentMessageStory.args = {
  caseId: 'b79cb3ba-745e-5d9a-8903-4a02327a7e01',
  message: { ...messages[0], consideredAsProcessed: null },
};
SentMessageStory.parameters = { ...defaultMswParameters };
SentMessageStory.play = async ({ canvasElement }) => {
  await within(canvasElement).findByRole('button', {
    name: /répondre/i,
  });
};

export const SentMessage = prepareStory(SentMessageStory, {
  childrenContext: {
    context: MessengerViewerContext,
    value: {
      ContextualMessengerSender: MessengerSenderNormalStory,
    },
  },
});
