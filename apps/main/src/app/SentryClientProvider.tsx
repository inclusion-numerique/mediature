'use client';

import * as Sentry from '@sentry/nextjs';
import { PropsWithChildren, useEffect } from 'react';

import { useSession } from '@mediature/main/src/proxies/next-auth/react';

export function SentryClientProvider({ children }: PropsWithChildren) {
  const sessionWrapper = useSession();

  useEffect(() => {
    // Set Sentry user ID
    if (sessionWrapper.status === 'authenticated') {
      Sentry.configureScope((scope) => scope.setUser({ id: sessionWrapper.data.user.id }));
    } else if (sessionWrapper.status === 'unauthenticated') {
      Sentry.configureScope((scope) => scope.setUser(null));
    }
  }, [sessionWrapper.status, sessionWrapper.data]);

  return <>{children}</>;
}
