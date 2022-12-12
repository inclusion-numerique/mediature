declare module '*.txt' {
  const content: string;
  export default content;
}

declare module '*.html' {
  const content: string;
  export default content;
}

interface ServerRuntimeConfig {
  //
}

interface PublicRuntimeConfig {
  appMode: 'prod' | 'dev' | 'test';
  appVersion: string;
}

interface RuntimeConfig {
  serverRuntimeConfig: ServerRuntimeConfig;
  publicRuntimeConfig: PublicRuntimeConfig;
}

declare module 'next/config' {
  const value: () => RuntimeConfig;
  export default value;
}

declare module 'next-auth' {
  import { DefaultSession, Session } from 'next-auth';

  import { TokenUserSchemaType } from '@mediature/main/models/entities/user';

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

declare module 'next-auth/jwt' {
  import { JwtDataSchemaType } from '@mediature/main/models/entities/user';

  // We fought for a long time by thinking extending the original our custom with the original name would work...
  // but it's merging types in all cases (ending with `string | null | undefined` sometimes). Better to rewrite the redefine interface with no `extends`.
  interface JWT {
    sub: JwtDataSchemaType['sub'];
    email: JwtDataSchemaType['email'];
    given_name: JwtDataSchemaType['given_name'];
    family_name: JwtDataSchemaType['family_name'];
    picture: JwtDataSchemaType['picture'];
  }
}
