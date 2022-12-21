const fg = require('fast-glob');
const path = require('path');
const cssnano = require('cssnano');

const getStories = () =>
  fg.sync([
    path.resolve(__dirname, '../../../apps/docs/stories/**/*.stories.{mdx,tsx}'),
    path.resolve(__dirname, '../../../apps/main/**/*.stories.{mdx,tsx}'),
    path.resolve(__dirname, '../../../packages/ui/src/**/*.stories.{mdx,tsx}'),
    '!**/node_modules', // Important otherwise it loads from PNPM workspace packages too resulting in the error `Duplicate stories with id: xxx`
  ]);

module.exports = {
  stories: async () => [...getStories()],
  staticDirs: ['../public'],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-essentials',
    '@storybook/addon-links',
    '@storybook/addon-measure',
    // '@storybook/addon-notes', // TODO: enable a new time, but for now seems uncompatible with Storybook v7
    '@storybook/addon-viewport',
    '@tomfreudenberg/next-auth-mock/storybook',
    'storybook-addon-designs',
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
    config.module.rules = [];

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
