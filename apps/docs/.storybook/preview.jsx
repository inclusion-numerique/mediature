import { MuiDsfrThemeProvider } from '@codegouvfr/react-dsfr/mui';
import { DsfrHead } from '@codegouvfr/react-dsfr/next-appdir/DsfrHead';
import { DsfrProvider } from '@codegouvfr/react-dsfr/next-appdir/DsfrProvider';
import { withLinks } from '@storybook/addon-links';
import addons from '@storybook/addons';
import { configure as testingConfigure } from '@storybook/testing-library';
import { themes } from '@storybook/theming';
import { withMockAuth } from '@tomfreudenberg/next-auth-mock/storybook';
import { initialize, mswDecorator } from 'msw-storybook-addon';
import React from 'react';

import { MockProvider } from '@mediature/docs/.storybook/MockProvider';
import { ThemedDocsContainer } from '@mediature/docs/.storybook/ThemedDocsContainer';
// import { DARK_MODE_EVENT_NAME, UPDATE_DARK_MODE_EVENT_NAME } from 'storybook-dark-mode';
import { disableGlobalDsfrStyle } from '@mediature/docs/.storybook/helpers';
import '@mediature/docs/.storybook/layout.scss';
import { withDisablingTestRunner } from '@mediature/docs/.storybook/testing';
// import { useDarkMode } from 'storybook-dark-mode';
import { StartDsfr } from '@mediature/main/src/app/StartDsfr';
import { Providers } from '@mediature/main/src/app/providers';
import { StorybookRendererLayout } from '@mediature/ui/src/emails/layouts/storybook-renderer';

// const channel = addons.getChannel();

if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
    // When using test runners they may inherit from system settings or the dark mode addon
    // which is not wanted. So each test make sure to manually set `light` or `dark` as color scheme.
    // The tricky part is `testing-library` and/or `playwright` have not access to the `jsdom` to manipulate the DOM (and it's not possible to set it up due to Storybook testing logic)
    // so we emulate a media query into the testing browser that we listen changes from, like that we can change the theming.
    // Note: we didn't scope it to tests otherwise we should hack a bit to inject a variable into the `window` to read it... but it's unlikely you will change your OS color settings while developing :)
    const newColorScheme = event.matches ? 'dark' : 'light';

    document.documentElement.dataset.theme = newColorScheme;
    document.documentElement.dataset.frTheme = newColorScheme;
    document.documentElement.dataset.frScheme = newColorScheme;
  });
}

// Initialize MSW
const mswServerSingleton = initialize({
  onUnhandledRequest: (request, print) => {
    if (request.url.pathname.startsWith('/api/')) {
      // If API calls are not handled it means they are missing handlers for the server mock
      print.error();
    } else {
      // Otherwise let XHR library get local files, favicon...
      request.passthrough();
    }
  },
});

// Increase the timeout because when testing (test runners or interactions panel) all async methods like `findBy`
// have 1 second of timeout, this is sometimes too short when there are multiple loadings behind
testingConfigure({ asyncUtilTimeout: 10 * 1000 });

export const parameters = {
  nextjs: {
    appDirectory: true,
  },
  darkMode: {
    current: 'light',
    stylePreview: true,
    dark: { ...themes.dark },
    light: { ...themes.light },
  },
  docs: {
    container: (props) => {
      // const [isDark, setDark] = React.useState();

      //
      // TODO: `channel` not available for now since upgrade to Storybook v7
      //

      // const onChangeHandler = () => {
      //   channel.emit(UPDATE_DARK_MODE_EVENT_NAME);
      // };

      // React.useEffect(() => {
      //   channel.on(DARK_MODE_EVENT_NAME, setDark);
      //   return () => channel.removeListener(DARK_MODE_EVENT_NAME, setDark);
      // }, [channel, setDark]);

      return (
        <div>
          {/* <input type="checkbox" onChange={onChangeHandler} /> */}
          <ThemedDocsContainer {...props} />
        </div>
      );
    },
  },
  a11y: {
    config: {
      rules: [
        {
          // A layout footer button targets a theming modal that we do not render to keep things simple, ignore this button violation
          id: 'aria-valid-attr-value',
          selector: '*:not([aria-controls="fr-theme-modal"])',
        },
        {
          // TODO: for now the user avatar background color is generated with a simple algorithm but does not respect the ratio
          id: 'color-contrast',
          selector: '*:not(.MuiAvatar-circular.UserAvatar)',
        },
      ],
    },
  },
};

export const decorators = [
  withLinks,
  withMockAuth,
  mswDecorator,
  (Story, context) => {
    // Provide the necessary depending on the context

    if (context.kind.startsWith('Emails/')) {
      // We are in the email templating context, a specific wrapper is needed to render

      disableGlobalDsfrStyle(true); // Workaround for global style leaking

      return (
        <StorybookRendererLayout>
          <Story />
        </StorybookRendererLayout>
      );
    } else {
      // For now for all other cases we provide the client provider to mock tRPC calls

      disableGlobalDsfrStyle(false); // Workaround for global style leaking

      return (
        <>
          <StartDsfr />
          <DsfrHead defaultColorScheme={context.parameters.darkMode.current} />
          <DsfrProvider defaultColorScheme={context.parameters.darkMode.current}>
            <MuiDsfrThemeProvider>
              <MockProvider>
                <Providers>
                  <Story />
                </Providers>
              </MockProvider>
            </MuiDsfrThemeProvider>
          </DsfrProvider>
        </>
      );
    }
  },
  withDisablingTestRunner, // This must be the latest to avoid other decorators to be called
];
