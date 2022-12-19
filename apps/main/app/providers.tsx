'use client';

import { PropsWithChildren } from 'react';

import { ClientProvider } from '@mediature/main/client/trpcClient';
import { SessionProvider } from '@mediature/main/proxies/next-auth/react';

export default function Providers(props: PropsWithChildren) {
  return (
    <ClientProvider>
      <SessionProvider>{props.children}</SessionProvider>
    </ClientProvider>
  );
}
