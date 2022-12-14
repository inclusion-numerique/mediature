'use client';

import { ConfirmProvider } from 'material-ui-confirm';
import { PropsWithChildren } from 'react';
import { createContext, useContext } from 'react';

import { ClientProvider } from '@mediature/main/src/client/trpcClient';
import { SessionProvider } from '@mediature/main/src/proxies/next-auth/react';

export const ProvidersContext = createContext({
  ContextualSessionProvider: SessionProvider,
});

export function Providers(props: PropsWithChildren) {
  const { ContextualSessionProvider } = useContext(ProvidersContext);

  return (
    <ConfirmProvider
      defaultOptions={{
        title: 'Confirmation',
        description: 'Êtes-vous sûr de vouloir continuer ?',
        cancellationText: 'Annuler',
        confirmationText: 'Confirmer',
        confirmationButtonProps: { autoFocus: true, variant: 'contained' },
        dialogActionsProps: {
          sx: { p: 2 },
        },
      }}
    >
      <ClientProvider>
        <ContextualSessionProvider>{props.children}</ContextualSessionProvider>
      </ClientProvider>
    </ConfirmProvider>
  );
}
