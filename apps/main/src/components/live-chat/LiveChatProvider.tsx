'use client';

import { Crisp } from 'crisp-sdk-web';
import { useSearchParams } from 'next/navigation';
import { PropsWithChildren, useCallback, useState } from 'react';
import { useEffect } from 'react';

import { trpc } from '@mediature/main/src/client/trpcClient';
import { LiveChatContext } from '@mediature/main/src/components/live-chat/LiveChatContext';
import { useSession } from '@mediature/main/src/proxies/next-auth/react';

const crispWebsiteId: string = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID || process.env.CRISP_WEBSITE_ID || 'no_crisp_settings';

export const LiveChatProvider = ({ children }: PropsWithChildren) => {
  const sessionWrapper = useSession();
  const trpcContext = trpc.useContext();

  const searchParams = useSearchParams();
  const sessionIdToResume = searchParams.get('crisp_sid');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadedOnce, setLoadedOnce] = useState<boolean>(false);

  const showLiveChat = useCallback(async () => {
    try {
      setIsLoading(true);

      // If the visitor is a user, try to fetch live chat settings to feed session data
      if (sessionWrapper.status === 'authenticated' && !loadedOnce) {
        const { settings } = await trpcContext.getLiveChatSettings.fetch({});

        Crisp.setTokenId(settings.sessionToken);
        Crisp.user.setEmail(settings.email, process.env.APP_MODE === 'prod' ? settings.emailSignature : undefined);
        Crisp.user.setNickname(`${settings.firstname} ${settings.lastname}`);
        Crisp.session.setData({
          user_id: settings.userId,
        });

        setLoadedOnce(true);
      }
    } finally {
      setIsLoading(false);

      // Even if it failed retrieving information for this user, let the user contact the support
      Crisp.chat.open();
    }
  }, [sessionWrapper.status, loadedOnce, trpcContext.getLiveChatSettings]);

  useEffect(() => {
    Crisp.configure(crispWebsiteId, {
      autoload: !!sessionIdToResume, // If the user comes from a Crisp email to reply to the session, we load Crisp and this one should handle retrieving previous session
      cookieExpire: 7 * 24 * 60 * 60, // Must be in seconds, currently 7 days instead of the default 6 months
      sessionMerge: true,
      locale: 'fr',
    });

    if (sessionIdToResume) {
      showLiveChat();
    }

    return () => {
      // Crisp should allow us to destroy the instance (for Storybook for example)
      // Ref: https://stackoverflow.com/questions/71967230/how-to-destroy-crisp-chat
    };
  }, [showLiveChat, sessionIdToResume]);

  return (
    <>
      <LiveChatContext.Provider
        value={{
          showLiveChat: showLiveChat,
          isLiveChatLoading: isLoading,
        }}
      >
        {children}
      </LiveChatContext.Provider>
    </>
  );
};
