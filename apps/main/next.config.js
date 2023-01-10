const { withSentryConfig } = require('@sentry/nextjs');
const CopyPlugin = require('copy-webpack-plugin');
const gitRevision = require('git-rev-sync');
const path = require('path');

const { getCommitSha, getHumanVersion, getTechnicalVersion } = require('./src/utils/app-version.js');

const mode = process.env.APP_MODE || 'test';

const copyPrismaSchema = (file) => ({
  // TODO: prisma issue with the schema https://github.com/prisma/prisma/issues/10433
  from: '../../apps/main/prisma/schema.prisma',
  // from: path.join(__dirname, 'prisma/schema.prisma'),
  to: path.join(__dirname, file),
});

// TODO: once Next supports `next.config.js` we can set types like `ServerRuntimeConfig` and `PublicRuntimeConfig` below
const moduleExports = async () => {
  let standardModuleExports = {
    reactStrictMode: true,
    swcMinify: true,
    // output: 'standalone', // This was great to use in case of a Docker image, but it's totally incompatible with Scalingo build pipeline, giving up this size reducing way :D
    env: {},
    serverRuntimeConfig: {},
    publicRuntimeConfig: {
      appMode: mode,
      appVersion: await getHumanVersion(),
    },
    // i18n: {
    //   locales: ['fr'],
    //   defaultLocale: 'fr',
    // },
    experimental: {
      appDir: true,
      serverComponentsExternalPackages: ['@prisma/client'], // TODO: to remove or not? https://github.com/prisma/prisma/issues/10433#issuecomment-1346198205
      outputFileTracingRoot: path.join(__dirname, '../../'),
      swcPlugins: [['next-superjson-plugin', { excluded: [] }]],
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
      // Silent a module import error due to RSC
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        child_process: false,
        v8: false,
      };

      config.plugins.push(
        new CopyPlugin({
          patterns: [copyPrismaSchema('.next/cache/webpack/client-development/'), copyPrismaSchema('.next/cache/webpack/server-development/')],
        })
      );

      config.module.rules.push({
        test: /\.woff2$/,
        type: 'asset/resource',
      });

      config.module.rules.push({
        test: /\.(txt|html)$/i,
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
      return await getTechnicalVersion();
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
    process.env.SENTRY_RELEASE_TAG = await getHumanVersion();
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
      commit: getCommitSha(),
      // auto: true,
    },
    deploy: {
      env: mode,
    },
  };

  // TODO: enable again Sentry once they accept `appDir: true` Next projects
  // Ref: https://github.com/getsentry/sentry-javascript/issues/6290#issuecomment-1329293619
  // return withSentryConfig(standardModuleExports, sentryWebpackPluginOptions);
  return standardModuleExports;
};

module.exports = moduleExports;
