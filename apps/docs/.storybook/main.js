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
    '@storybook/addon-notes',
    '@storybook/addon-viewport',
    'storybook-addon-designs',
    // 'storybook-addon-next-router',
    'storybook-addon-pseudo-states',
    'storybook-dark-mode',
  ],
  framework: '@storybook/react',
  core: {
    builder: '@storybook/builder-vite',
    enableCrashReports: false,
    disableTelemetry: true,
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
        'process.env.TRPC_SERVER_MOCK': 'true', // Warning: for whatever reason it's a boolean during the runtime
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
