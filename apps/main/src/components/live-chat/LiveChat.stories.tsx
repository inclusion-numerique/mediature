import { Meta, StoryFn } from '@storybook/react';
import { screen } from '@storybook/test';
import { useEffect } from 'react';

import { userSessionContext } from '@mediature/docs/.storybook/auth';
import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { LiveChatProvider } from '@mediature/main/src/components/live-chat/LiveChatProvider';
import { useLiveChat } from '@mediature/main/src/components/live-chat/useLiveChat';
import { users } from '@mediature/main/src/fixtures/user';
import { LiveChatSettingsSchema } from '@mediature/main/src/models/entities/user';
import { getTRPCMock } from '@mediature/main/src/server/mock/trpc';

type ComponentType = any;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Components/LiveChat',
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

const defaultMswParameters = {
  msw: {
    handlers: [
      getTRPCMock({
        type: 'query',
        path: ['getLiveChatSettings'],
        response: {
          settings: LiveChatSettingsSchema.parse({
            userId: users[0].id,
            email: users[0].email,
            emailSignature: 'abcdef',
            firstname: users[0].firstname,
            lastname: users[0].lastname,
            sessionToken: 'xyz',
          }),
        },
      }),
    ],
  },
};

const Template: StoryFn<ComponentType> = () => {
  const { showLiveChat, isLiveChatLoading } = useLiveChat();

  // useEffect(() => {
  //   showLiveChat();
  // }, [showLiveChat]);

  return (
    <>
      <h6>
        LiveChat page (it won&apos;t init completely since we don&apos;t have a reliable website ID for local environments... and they don&apos;t have
        an in-library &quot;sandbox/debug&quot; mode)
      </h6>
      <p>
        [IMPORTANT] For now there is no way to hide Crisp when switching to another story... We did try to remove `.crisp-client` from the DOM but due
        to this sometimes it won&apos;t show up a new time. Giving up for now...
      </p>
    </>
  );
};

const NormalStory = Template.bind({});
NormalStory.args = {};
NormalStory.parameters = {
  ...defaultMswParameters,
  nextjs: {
    navigation: {
      query: {
        session_end: true,
      },
    },
  },
  nextAuthMock: {
    session: userSessionContext,
  },
};
NormalStory.decorators = [
  (Story: StoryFn) => {
    return (
      <LiveChatProvider>
        <Story />
      </LiveChatProvider>
    );
  },
];
// NormalStory.play = async ({ canvasElement }) => {
//   await screen.findByRole('button');
// };

export const Normal = prepareStory(NormalStory);
