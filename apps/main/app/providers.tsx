'use client';

import { SessionProvider } from 'next-auth/react';

import { ClientProvider } from '@mediature/main/client/trpcClient';

export default function Providers({ children }) {
  return (
    <ClientProvider>
      <SessionProvider>{children}</SessionProvider>
    </ClientProvider>
  );
}
