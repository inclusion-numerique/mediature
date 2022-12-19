import { signIn as real_signIn } from 'next-auth/react';
import { signOut as real_signOut } from 'next-auth/react';

import { areMocksGloballyEnabled } from '@mediature/main/utils/environment';

export { useSession, SessionProvider } from 'next-auth/react';

const mock_signIn: typeof real_signIn = async function () {
  console.log(`"signIn" mock has been called`);

  return {
    error: undefined,
    status: 200,
    ok: true,
    url: '/no-matter',
  } as any; // "any" is not great, but that's how they do in the official code due to complex typings (ref: https://github.com/nextauthjs/next-auth/blob/2c669b32fc51ede4ed334384fbdbe01dc1cce9cc/packages/next-auth/src/react/index.tsx#L276)
};

export const signIn: typeof real_signIn = areMocksGloballyEnabled() ? mock_signIn : real_signIn;

const mock_signOut: typeof real_signOut = async function () {
  console.log(`"signOut" mock has been called`);

  return {
    url: '/no-matter',
  } as any;
};

export const signOut: typeof real_signOut = areMocksGloballyEnabled() ? mock_signOut : real_signOut;
