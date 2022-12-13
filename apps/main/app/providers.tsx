'use client';

import { SessionProvider } from 'next-auth/react';
import { PropsWithChildren } from 'react';

import { ClientProvider } from '@mediature/main/client/trpcClient';

export default function Providers(props: PropsWithChildren) {
  return (
    <ClientProvider>
      <SessionProvider>{props.children}</SessionProvider>
    </ClientProvider>
  );
}
