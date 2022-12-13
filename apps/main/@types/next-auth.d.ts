import { DefaultSession, Session } from 'next-auth';

import { TokenUserSchemaType } from '@mediature/main/models/entities/user';

declare module 'next-auth' {
  interface Session {
    expires: DefaultSession['expires'];
    user: TokenUserSchemaType;
  }

  // We fought for a long time by thinking extending the original our custom with the original name would work...
  // but it's merging types in all cases (ending with `string | null | undefined` sometimes). Better to rewrite the redefine interface with no `extends`.
  interface User {
    id: TokenUserSchemaType['id'];
    email: TokenUserSchemaType['email'];
    firstname: TokenUserSchemaType['firstname'];
    lastname: TokenUserSchemaType['lastname'];
    lastname: TokenUserSchemaType['lastname'];
    profilePicture: TokenUserSchemaType['profilePicture'];
  }
}
