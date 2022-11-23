const path = require('path');

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
    return {
      ...config,
      resolve: {
        alias: [
          {
            // TODO: example for now, should we set this everywhere?
            find: '@mediature/ui',
            replacement: path.resolve(__dirname, '../../../packages/ui/'),
          },
        ],
      },
    };
  },
};
