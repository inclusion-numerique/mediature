import webpackPreprocessor from '@cypress/webpack-preprocessor';
import { defineConfig } from 'cypress';
import path from 'path';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

export default defineConfig({
  video: false,
  downloadsFolder: 'tests/downloads',
  fixturesFolder: 'tests/fixtures',
  screenshotsFolder: 'tests/screenshots',
  videosFolder: 'tests/videos',

  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'tests/support/e2e.{js,jsx,ts,tsx}',
    specPattern: 'tests/e2e/**/*.cy.{js,jsx,ts,tsx}',
    setupNodeEvents(on: any, config) {
      const preprocessorConfig = webpackPreprocessor.defaultOptions;

      preprocessorConfig.webpackOptions.resolve = {
        // plugins: [
        //   new TsconfigPathsPlugin({
        //     configFile: path.resolve(__dirname, '../../../packages/tsconfig/base.json'),
        //   }),
        // ],
        // -----
        // TODO: the above is supposed to work... but it's not, so hardcoding paths for now (we could use the same than we did with Jest + Array.map)
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        alias: {
          '@mediature/docs': path.resolve(__dirname, '../../apps/docs/'),
          '@mediature/main': path.resolve(__dirname, '../../apps/main/'),
          '@mediature/ui': path.resolve(__dirname, '../../apps/ui/'),
          '@trpc/next-layout': path.resolve(__dirname, '../../apps/trpc-next-layout/'),
        },
      };

      on('file:preprocessor', webpackPreprocessor(preprocessorConfig));
    },
  },

  component: {
    // TODO: not working for now... probably due to conflicts between Webpack 4 and 5 since Sentry plugin still use the v4.x
    // Here the error we get when using component testing: `The 'compilation' argument must be an instance of Compilation`
    supportFile: 'tests/support/component.{js,jsx,ts,tsx}',
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
  },
});
