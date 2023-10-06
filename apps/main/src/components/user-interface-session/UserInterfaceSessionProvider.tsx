import { PropsWithChildren } from 'react';

import {
  UserInterfaceSessionContext,
  UserInterfaceSessionContextType,
} from '@mediature/main/src/components/user-interface-session/UserInterfaceSessionContext';

export const UserInterfaceSessionProvider = ({ children, session }: PropsWithChildren<UserInterfaceSessionContextType>) => {
  return (
    <UserInterfaceSessionContext.Provider
      value={{
        session: session,
      }}
    >
      {children}
    </UserInterfaceSessionContext.Provider>
  );
};
