import { defineConfig } from 'cypress';

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
    setupNodeEvents(on, config) {
      // implement node event listeners here
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
