'use client';

import { PropsWithChildren } from 'react';

import { ClientProvider } from '@mediature/main/src/client/trpcClient';
import { SessionProvider } from '@mediature/main/src/proxies/next-auth/react';

export function Providers(props: PropsWithChildren) {
  return (
    <ClientProvider>
      <SessionProvider>{props.children}</SessionProvider>
    </ClientProvider>
  );
}

export default Providers;
