// [IMPORTANT]: when this Storybook subpackage installs `next-auth` it breaks the `@tomfreudenberg/next-auth-mock`... so for now just simulating types
// import { DefaultSession } from 'next-auth';
import { TokenUserSchemaType } from '@mediature/main/src/models/entities/user';

export interface Session {
  // expires: DefaultSession['expires'];
  expires: string;
  user: TokenUserSchemaType;
}

export interface SessionContext {
  status: 'unauthenticated' | 'authenticated' | 'loading';
  data: Session | null;
}

//
// Find fixtures below to facilite the story creation
//

export const visitorSessionContext: SessionContext = {
  status: 'unauthenticated',
  data: null,
};

export const userSessionContext: SessionContext = {
  status: 'authenticated',
  data: {
    expires: new Date('December 17, 2304 03:24:00 UTC').toISOString(),
    user: {
      id: '00000000-0000-0000-0000-000000000000',
      email: 'jean@france.com',
      firstname: 'Jean',
      lastname: 'Derrien',
      profilePicture: null,
    },
  },
};
