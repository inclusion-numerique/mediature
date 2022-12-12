import { createMuiDsfrThemeProvider } from '@codegouvfr/react-dsfr/mui';
import { createNextDsfrIntegrationApi } from '@codegouvfr/react-dsfr/next';
import DefaultApp from 'next/app';
import getConfig from 'next/config';
import type { LinkProps as NextLinkProps } from 'next/link';
import { PropsWithChildren } from 'react';
import { createEmotionSsrAdvancedApproach } from 'tss-react/next';

import Providers from '@mediature/main/app/providers';

// declare module '@codegouvfr/react-dsfr' {
//   export interface LinkProps extends NextLinkProps {}
// }

// const { withDsfr, dsfrDocumentApi } = createNextDsfrIntegrationApi({
//   defaultColorScheme: 'system',
//   preloadFonts: [
//     //"Marianne-Light",
//     //"Marianne-Light_Italic",
//     'Marianne-Regular',
//     //"Marianne-Regular_Italic",
//     'Marianne-Medium',
//     //"Marianne-Medium_Italic",
//     'Marianne-Bold',
//     //"Marianne-Bold_Italic",
//     //"Spectral-Regular",
//     //"Spectral-ExtraBold"
//   ],
// });

// const { getColorSchemeHtmlAttributes, augmentDocumentForDsfr } = dsfrDocumentApi;

// const { MuiDsfrThemeProvider } = createMuiDsfrThemeProvider();

// const { withAppEmotionCache, augmentDocumentWithEmotionCache } = createEmotionSsrAdvancedApproach({
//   key: 'css',
// });

// withDsfr(withApp)

export default function RootLayout(props: PropsWithChildren) {
  // TODO: show app version once `next/config` is available
  // Ref: https://github.com/vercel/next.js/issues/42065#issuecomment-1298530144
  // const { publicRuntimeConfig } = getConfig();

  return (
    <html lang="en">
      {/* <html lang="en" {...getColorSchemeHtmlAttributes(props as any)}> */}
      {/* <head></head> */}
      <body>
        {/* <MuiDsfrThemeProvider> */}
        <Providers>{props.children}</Providers>
        {/* <div>{publicRuntimeConfig.appVersion}</div> */}
        {/* </MuiDsfrThemeProvider> */}
      </body>
    </html>
  );
}
