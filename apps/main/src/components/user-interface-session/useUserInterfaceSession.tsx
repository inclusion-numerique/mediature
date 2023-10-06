import { useContext } from 'react';

import { UserInterfaceSessionContext } from '@mediature/main/src/components/user-interface-session/UserInterfaceSessionContext';

export const useUserInterfaceSession = () => {
  const { session } = useContext(UserInterfaceSessionContext);

  return {
    userInterfaceSession: session,
  };
};

export const useUserInterfaceAuthority = (authorityId: string) => {
  const { session } = useContext(UserInterfaceSessionContext);

  return {
    userInterfaceAuthority:
      session?.agentOf.find((authority) => {
        return authority.id === authorityId;
      }) || null,
  };
};
