const fg = require('fast-glob');
const path = require('path');
const { mergeConfig } = require('vite');

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
    // '@tomfreudenberg/next-auth-mock/storybook',
    'storybook-addon-designs',
    // {
    //   name: 'storybook-addon-next',
    //   options: {
    //     nextConfigPath: path.resolve(__dirname, '../../../apps/main/next.config.js'),
    //   },
    // },
    // 'storybook-addon-next-router',
    'storybook-addon-pseudo-states',
    'storybook-dark-mode',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  core: {
    enableCrashReports: false,
    disableTelemetry: true,
  },
  docs: {
    docsPage: 'automatic',
  },
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
      define: {
        'process.env': {
          // Warning: for whatever reason it's a boolean during the runtime
          ENABLE_MOCKS: 'true',
          STORYBOOK_ENVIRONMENT: 'true',
          TRPC_SERVER_MOCK: 'true',
        },
      },
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
};
