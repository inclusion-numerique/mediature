const cssnano = require('cssnano');
const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  stories: [
    // Lookup wildcards should not meet a `node_modules` because due to `pnpm` symlinks everything break
    // We scoped everything in folders like `stories` and `src` in each package
    // Ref: https://github.com/storybookjs/storybook/issues/11181#issuecomment-1372243094
    path.resolve(__dirname, '../../../apps/docs/stories/**/*.stories.@(js|ts|jsx|tsx|mdx)'),
    path.resolve(__dirname, '../../../apps/main/src/**/*.stories.@(js|ts|jsx|tsx|mdx)'),
    path.resolve(__dirname, '../../../packages/ui/src/**/*.stories.@(js|ts|jsx|tsx|mdx)'),
  ],
  staticDirs: ['../public'],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-coverage',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-links',
    '@storybook/addon-measure',
    // '@storybook/addon-notes', // TODO: enable a new time, but for now seems uncompatible with Storybook v7
    '@storybook/addon-viewport',
    'storybook-addon-designs',
    'storybook-addon-pseudo-states',
    'storybook-dark-mode',
  ],
  features: {
    buildStoriesJson: true,
  },
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
        // lazyCompilation: true, // It's too slow for now
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
    // TODO: move the following to a `utils` to be reused elsewhere than in Storybook
    const originalRules = config.module.rules;
    config.module.rules = [
      {
        test: /\.ya?ml$/i,
        use: 'yaml-loader',
      },
    ];

    let scssRuleFound = false;
    for (const originalRule of originalRules) {
      // If for `sass` we add our additional one (they cannot colocate on the same level because they would be played both... resulting in CSS parsing errors)
      if (originalRule.test.test('.scss')) {
        scssRuleFound = true;

        config.module.rules.push({
          test: originalRule.test,
          oneOf: [
            {
              resourceQuery: /raw/, // foo.scss?raw
              use: [
                'raw-loader',
                {
                  loader: 'postcss-loader',
                  options: {
                    postcssOptions: {
                      // In our case getting raw style in to inject it in emails, we want to make sure it's minified to avoid comments and so on
                      plugins: [cssnano({ preset: 'default' })],
                    },
                  },
                },
                'resolve-url-loader',
                'sass-loader',
              ],
            },
            {
              use: originalRule.use,
            },
          ],
        });
      } else {
        config.module.rules.push(originalRule);
      }
    }

    if (!scssRuleFound) {
      throw new Error('our custom SCSS rule should have been added, make sure the project manage SCSS by default first');
    }

    if (!config.resolve) {
      config.resolve = {};
    }

    config.resolve.plugins = [
      new TsconfigPathsPlugin({
        configFile: path.resolve(__dirname, '../../../packages/tsconfig/base.json'),
      }),
    ];

    return config;
  },
  docs: {
    docsPage: true,
    autodocs: true,
  },
};
