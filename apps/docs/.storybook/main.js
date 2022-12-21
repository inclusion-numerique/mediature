const fg = require('fast-glob');
const path = require('path');

const getStories = () =>
  fg.sync([
    path.resolve(__dirname, '../../../apps/docs/stories/**/*.stories.{mdx,tsx}'),
    path.resolve(__dirname, '../../../apps/main/**/*.stories.{mdx,tsx}'),
    path.resolve(__dirname, '../../../packages/ui/src/**/*.stories.{mdx,tsx}'),
    '!**/node_modules', // Important otherwise it loads from PNPM workspace packages too resulting in the error `Duplicate stories with id: xxx`
  ]);

module.exports = {
  stories: async () => [...getStories()],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-essentials',
    '@storybook/addon-links',
    '@storybook/addon-measure',
    // '@storybook/addon-notes', // TODO: enable a new time, but for now seems uncompatible with Storybook v7
    '@storybook/addon-viewport',
    '@tomfreudenberg/next-auth-mock/storybook',
    'storybook-addon-designs',
    // 'storybook-addon-next-router',
    'storybook-addon-pseudo-states',
    'storybook-dark-mode',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {
      // https://github.com/storybookjs/storybook/tree/next/code/frameworks/nextjs
      nextConfigPath: path.resolve(__dirname, '../../../apps/main/next.config.js'),
    },
  },
  core: {
    enableCrashReports: false,
    disableTelemetry: true,
    builder: {
      name: 'webpack5',
      options: {
        fsCache: true,
        lazyCompilation: true,
      },
    },
  },
  env: (config) => ({
    ...config,
    ENABLE_MOCKS: 'true',
    STORYBOOK_ENVIRONMENT: 'true',
    TRPC_SERVER_MOCK: 'true',
  }),
  async webpackFinal(config, { configType }) {
    config.module.rules = [...config.module.rules];

    if (!config.resolve) {
      config.resolve = { alias: {} };
    }

    config.resolve.alias = {
      ...config.resolve.alias,
      path$: 'path-browserify',
      '@mediature/docs': '../../../apps/docs/',
      '@mediature/main': '../../../apps/main/',
      '@mediature/ui': '../../../packages/ui/',
      '@trpc/next-layout': '../../../packages/trpc-next-layout/',
    };

    return config;
  },
  docs: {
    docsPage: 'automatic',
  },
};
