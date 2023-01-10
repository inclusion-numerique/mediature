import { Display } from '@codegouvfr/react-dsfr/Display';
import { MuiDsfrThemeProvider } from '@codegouvfr/react-dsfr/mui';
import { DsfrHead } from '@codegouvfr/react-dsfr/next-appdir/DsfrHead';
import { DsfrProvider } from '@codegouvfr/react-dsfr/next-appdir/DsfrProvider';
import { getColorSchemeHtmlAttributes } from '@codegouvfr/react-dsfr/next-appdir/getColorSchemeHtmlAttributes';
import { PropsWithChildren } from 'react';
import { NextAppDirEmotionCacheProvider } from 'tss-react/next';

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
          <NextAppDirEmotionCacheProvider options={{ key: 'css' }}>
            <MuiDsfrThemeProvider>
              <Providers>{props.children}</Providers>
            </MuiDsfrThemeProvider>
            <Display />
          </NextAppDirEmotionCacheProvider>
        </DsfrProvider>
      </body>
    </html>
  );
}

export default RootLayout;
