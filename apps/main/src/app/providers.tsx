'use client';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ConfirmProvider } from 'material-ui-confirm';
import { PropsWithChildren } from 'react';
import { createContext, useContext } from 'react';
import { I18nextProvider } from 'react-i18next';

import { ClientProvider } from '@mediature/main/src/client/trpcClient';
import { dateFnsLocales, i18n } from '@mediature/main/src/i18n';
import { SessionProvider } from '@mediature/main/src/proxies/next-auth/react';
import { ModalProvider } from '@mediature/ui/src/modal/ModalProvider';

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
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={dateFnsLocales[i18n.language]}>
        <ClientProvider>
          <I18nextProvider i18n={i18n}>
            <ModalProvider>
              <ContextualSessionProvider>{props.children}</ContextualSessionProvider>
            </ModalProvider>
          </I18nextProvider>
        </ClientProvider>
      </LocalizationProvider>
    </ConfirmProvider>
  );
}
