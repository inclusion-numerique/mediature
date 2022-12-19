const path = require('path');
const { mergeConfig } = require('vite');
const { default: tsconfigPaths } = require('vite-tsconfig-paths');

module.exports = {
  stories: ['../stories/**/*.stories.mdx', '../stories/**/*.stories.tsx'],
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
  },
  env: (config) => ({
    ...config,
    ENABLE_MOCKS: 'true',
    TRPC_SERVER_MOCK: 'true',
  }),
  async viteFinal(config, { configType }) {
    // return mergeConfig(config, {
    //   plugins: [
    //     tsconfigPaths({
    //       projects: [path.resolve(__dirname, '../../../packages/tsconfig/base.json')],
    //     }),
    //   ],
    // });

    // TODO: the above is supposed to work... but it's not, so hardcoding paths for now
    return mergeConfig(config, {
      resolve: {
        alias: [
          {
            find: 'path',
            replacement: 'path-browserify',
          },
          {
            find: '@mediature/docs',
            replacement: path.resolve(__dirname, '../../../apps/docs/'),
          },
          {
            find: '@mediature/main',
            replacement: path.resolve(__dirname, '../../../apps/main/'),
          },
          {
            find: '@mediature/ui',
            replacement: path.resolve(__dirname, '../../../packages/ui/'),
          },
          {
            find: '@trpc/next-layout',
            replacement: path.resolve(__dirname, '../../../packages/trpc-next-layout/'),
          },
        ],
      },
    });
  },
  docs: {
    docsPage: 'automatic',
  },
};
