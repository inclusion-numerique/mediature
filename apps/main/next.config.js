const { withSentryConfig } = require('@sentry/nextjs');
const gitRevision = require('git-rev-sync');
const path = require('path');

const mode = 'dev'; // TODO: this should be based on running command (build or build-dev)... or... based on the environment envVar MODE (for CI, make...)

const moduleExports = {
  reactStrictMode: true,
  // output: 'standalone', // This was great to use in case of a Docker image, but it's totally incompatible with Scalingo build pipeline, giving up this size reducing way :D
  // i18n: {
  //   locales: ['fr'],
  //   defaultLocale: 'fr',
  // },
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../../'),
    transpilePackages: ['ui'],
  },
  sentry: {
    hideSourceMaps: mode === 'prod', // Do not serve sourcemaps in `prod`
    // disableServerWebpackPlugin: true, // TODO
    // disableClientWebpackPlugin: true, // TODO
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
  const formattedDate = gitRevision.date().toISOString().split('.')[0].replace(/\D/g, ''); // Remove milliseconds and keep only digits
  process.env.SENTRY_RELEASE_TAG = `v${process.env.npm_package_version}-${formattedDate}-${gitRevision.short(null, 12)}`;
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

module.exports = withSentryConfig(moduleExports, sentryWebpackPluginOptions);
