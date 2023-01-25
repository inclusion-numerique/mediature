import { Display } from '@codegouvfr/react-dsfr/Display';
import { DsfrHead } from '@codegouvfr/react-dsfr/next-appdir/DsfrHead';
import { DsfrProvider } from '@codegouvfr/react-dsfr/next-appdir/DsfrProvider';
import { getColorSchemeHtmlAttributes } from '@codegouvfr/react-dsfr/next-appdir/getColorSchemeHtmlAttributes';
import { PropsWithChildren } from 'react';

import { MuiDsfrThemeProvider } from '@mediature/main/src/app/MuiDsfrThemeProvider';
import { StartDsfr } from '@mediature/main/src/app/StartDsfr';
import '@mediature/main/src/app/layout.scss';
import { Providers } from '@mediature/main/src/app/providers';
import { defaultColorScheme } from '@mediature/main/src/utils/dsfr';

export function RootLayout(props: PropsWithChildren) {
  return (
    <html lang="fr" {...getColorSchemeHtmlAttributes({ defaultColorScheme })}>
      <head>
        <StartDsfr />
        <DsfrHead defaultColorScheme={defaultColorScheme} />
      </head>
      <body>
        <DsfrProvider defaultColorScheme={defaultColorScheme}>
          <MuiDsfrThemeProvider>
            <Providers>{props.children}</Providers>
          </MuiDsfrThemeProvider>
          <Display />
        </DsfrProvider>
      </body>
    </html>
  );
}

export default RootLayout;
