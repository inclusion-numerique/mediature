import { createContext } from 'react';

import { UserInterfaceSessionSchemaType } from '@mediature/main/src/models/entities/ui';

export interface UserInterfaceSessionContextType {
  session: UserInterfaceSessionSchemaType | null;
}

export const UserInterfaceSessionContext = createContext<UserInterfaceSessionContextType>({
  session: null,
});
