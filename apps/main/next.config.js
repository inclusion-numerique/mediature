const { withSentryConfig } = require('@sentry/nextjs');
const gitRevision = require('git-rev-sync');
const path = require('path');

const { getHumanVersion, getTechnicalVersion } = require('./utils/app-version.js');

const mode = process.env.APP_MODE || 'test';

// TODO: once Next supports `next.config.js` we can set types like `ServerRuntimeConfig` and `PublicRuntimeConfig` below
const moduleExports = {
  reactStrictMode: true,
  // output: 'standalone', // This was great to use in case of a Docker image, but it's totally incompatible with Scalingo build pipeline, giving up this size reducing way :D
  env: {},
  serverRuntimeConfig: {},
  publicRuntimeConfig: {
    appMode: mode,
    appVersion: getHumanVersion(),
  },
  // i18n: {
  //   locales: ['fr'],
  //   defaultLocale: 'fr',
  // },
  experimental: {
    appDir: true,
    outputFileTracingRoot: path.join(__dirname, '../../'),
    transpilePackages: ['@mediature/ui'],
  },
  async rewrites() {
    return [
      {
        source: '/robots.txt',
        destination: '/api/robots',
      },
    ];
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
    config.module.rules.push({
      test: /\.txt$/i,
      use: 'raw-loader',
    });

    return config;
  },
  sentry: {
    hideSourceMaps: mode === 'prod', // Do not serve sourcemaps in `prod`
    // disableServerWebpackPlugin: true, // TODO
    // disableClientWebpackPlugin: true, // TODO
  },
  poweredByHeader: false,
  generateBuildId: async () => {
    return getTechnicalVersion();
  },
};

//
// TODO: for now we cannot debug Sentry with `pnpm dev`, we have to build+start
// They are not ready for Next 13 yet... and it's probable by building with turbo nothing will be shipped in the final bundle
// Refs:
// - https://github.com/getsentry/sentry-docs/pull/5694/files
// - https://github.com/getsentry/sentry-javascript/issues/6056
//

const uploadToSentry = process.env.SENTRY_RELEASE_UPLOAD === 'true' && process.env.NODE_ENV === 'production';

if (uploadToSentry) {
  // Define here the environment variable we want to embed in the build (easier than managing it inside `chainWebpack()`)
  // Ref: https://stackoverflow.com/questions/53094975/vue-js-defining-computed-environment-variables-in-vue-config-js-vue-cli-3
  process.env.SENTRY_RELEASE_TAG = getHumanVersion();
}

const sentryWebpackPluginOptions = {
  dryRun: !uploadToSentry,
  debug: false,
  silent: false,
  release: process.env.SENTRY_RELEASE_TAG,
  include: './.next',
  ignore: ['node_modules', 'next.config.js'],
  setCommits: {
    // TODO: get error: caused by: sentry reported an error: You do not have permission to perform this action. (http status: 403)
    // Possible ref: https://github.com/getsentry/sentry-cli/issues/1388#issuecomment-1306137835
    // Note: not able to bind our repository to our on-premise Sentry as specified in the article... leaving it manual for now (no commit details...)
    auto: false,
    commit: gitRevision.long(),
    // auto: true,
  },
  deploy: {
    env: mode,
  },
};

// TODO: enable again Sentry once they accept `appDir: true` Next projects
// Ref: https://github.com/getsentry/sentry-javascript/issues/6290#issuecomment-1329293619
// module.exports = withSentryConfig(moduleExports, sentryWebpackPluginOptions);
module.exports = moduleExports;
