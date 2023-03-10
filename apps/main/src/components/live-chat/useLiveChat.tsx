import { useContext } from 'react';

import { LiveChatContext } from '@mediature/main/src/components/live-chat/LiveChatContext';

export const useLiveChat = () => {
  return useContext(LiveChatContext);
};
