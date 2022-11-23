const { withSentryConfig } = require('@sentry/nextjs');
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
    hideSourceMaps: true,
    disableServerWebpackPlugin: true, // TODO
    disableClientWebpackPlugin: true, // TODO
  },
};

//
// TODO: for now we cannot debug Sentry with `pnpm dev`, we have to build+start
// They are not ready for Next 13 yet... and it's probable by building with turbo nothing will be shipped in the final bundle
// Refs:
// - https://github.com/getsentry/sentry-docs/pull/5694/files
// - https://github.com/getsentry/sentry-javascript/issues/6056
//

const sentryWebpackPluginOptions = {
  dryRun: false, // TODO... depends on the environment + build (production, not serving)?
  debug: false,
  silent: false,
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE, // TODO: the value should be defined as done on previous project
  include: './dist',
  ignore: ['node_modules', 'next.config.js'],
  setCommits: {
    auto: true,
  },
  deploy: {
    env: mode,
  },
};

module.exports = withSentryConfig(moduleExports, sentryWebpackPluginOptions);
