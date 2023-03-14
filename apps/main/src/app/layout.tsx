import { Display } from '@codegouvfr/react-dsfr/Display';
import { DsfrHead } from '@codegouvfr/react-dsfr/next-appdir/DsfrHead';
import { DsfrProvider } from '@codegouvfr/react-dsfr/next-appdir/DsfrProvider';
import { getColorSchemeHtmlAttributes } from '@codegouvfr/react-dsfr/next-appdir/getColorSchemeHtmlAttributes';
import Script from 'next/script';
import { PropsWithChildren } from 'react';

import { MuiDsfrThemeProvider } from '@mediature/main/src/app/MuiDsfrThemeProvider';
import { StartDsfr } from '@mediature/main/src/app/StartDsfr';
import '@mediature/main/src/app/cookie-consent-dsfr.scss';
import '@mediature/main/src/app/layout.scss';
import { Providers } from '@mediature/main/src/app/providers';
import { LiveChatProvider } from '@mediature/main/src/components/live-chat/LiveChatProvider';
import { defaultColorScheme } from '@mediature/main/src/utils/dsfr';

export interface RootLayoutProps {
  workaroundForNextJsPages?: boolean;
}

function MainStructure(props: PropsWithChildren) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        {/* The style of the DSFR "tarteaucitron" is in the app directory directly to benefit from SCSS */}
        {/* The 3 scripts are needed due to the desisgn of the library... */}
        <Script src="/assets/scripts/tarteaucitron.preinit.js" strategy="afterInteractive" />
        <Script src="/assets/tarteaucitronjs/tarteaucitron.js" strategy="afterInteractive" />
        <Script src="/assets/scripts/tarteaucitron.init.js" strategy="afterInteractive" />
        <StartDsfr />
        <DsfrHead defaultColorScheme={defaultColorScheme} />
      </head>
      <body>
        <DsfrProvider defaultColorScheme={defaultColorScheme}>
          <MuiDsfrThemeProvider>
            <Providers>
              <LiveChatProvider>{props.children}</LiveChatProvider>
            </Providers>
          </MuiDsfrThemeProvider>
          <Display />
        </DsfrProvider>
      </body>
    </>
  );
}

export function RootLayout(props: PropsWithChildren<RootLayoutProps>) {
  if (props.workaroundForNextJsPages === true) {
    // When embedded through a server-side only page (for errors for example) `<html>` and `<body>`
    // are already included by Next.js (the browser can ajust the structure but in our case `<html>` duplication
    // throws a visible error in development so we avoid it (it does not change things that much since it's only specific pages))
    return <MainStructure {...props} />;
  }

  return (
    <html lang="fr" {...getColorSchemeHtmlAttributes({ defaultColorScheme })}>
      <MainStructure {...props} />
    </html>
  );
}

export default RootLayout;
