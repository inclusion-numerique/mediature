import { JwtDataSchemaType } from '@mediature/main/src/models/entities/user';

declare module 'next-auth/jwt' {
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
