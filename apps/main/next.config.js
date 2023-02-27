const cssnano = require('cssnano');
const path = require('path');
const tsImport = require('ts-import');

const tsImportLoadOptions = {
  mode: tsImport.LoadMode.Compile,
  compilerOptions: {
    paths: {
      // [IMPORTANT] Paths are not working, we modified inside files to use relative ones where needed
      '@mediature/main/*': ['../../apps/main/*'],
    },
  },
};

const { generateRewrites, localizedRoutes } = tsImport.loadSync(path.resolve(__dirname, `./src/utils/routes/list.ts`), tsImportLoadOptions);
const { getBaseUrl } = tsImport.loadSync(path.resolve(__dirname, `./src/utils/url.ts`), tsImportLoadOptions);

const { withSentryConfig } = require('@sentry/nextjs');
const gitRevision = require('git-rev-sync');
const { getCommitSha, getHumanVersion, getTechnicalVersion } = require('./src/utils/app-version.js');
const { convertHeadersForNextjs, securityHeaders } = require('./src/utils/http.js');
const { i18n } = require('./next-i18next.config');

const mode = process.env.APP_MODE || 'test';

const nextjsSecurityHeaders = convertHeadersForNextjs(securityHeaders);
const baseUrl = new URL(getBaseUrl());

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
    i18n: i18n,
    eslint: {
      ignoreDuringBuilds: true, // Skip since already done in a specific step of our CI/CD
    },
    typescript: {
      ignoreBuildErrors: true, // Skip since already done in a specific step of our CI/CD
    },
    transpilePackages: ['@mediature/ui', 'pretty-bytes'],
    experimental: {
      appDir: true,
      outputFileTracingRoot: path.join(__dirname, '../../'),
      swcPlugins: [['next-superjson-plugin', { excluded: [] }]],
    },
    async rewrites() {
      return [
        ...generateRewrites('en', localizedRoutes),
        {
          source: '/.well-known/security.txt',
          destination: '/api/security',
        },
        {
          source: '/robots.txt',
          destination: '/api/robots',
        },
      ];
    },
    async headers() {
      return [
        {
          source: '/:path*', // All routes
          headers: nextjsSecurityHeaders,
        },
      ];
    },
    images: {
      remotePatterns: [
        {
          protocol: baseUrl.protocol.slice(0, -1),
          hostname: baseUrl.hostname,
        },
        {
          protocol: 'https',
          hostname: 'via.placeholder.com',
        },
      ],
    },
    webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
      // Inject a style loader when we want to use `foo.scss?raw` for backend processing (like emails)
      // It was not easy because adding this rule was making Next.js removing all default style loaders saying we use a custom style so it left us with nothing...
      // It's due to this check https://github.com/vercel/next.js/blob/d3e3f28b418a408d865cd7cde255af888739da45/packages/next/build/webpack-config.ts#L1468-L1474
      // The trick below is to parse their rules tree and when they use Sass loaders we add our own rule at the beginning of the chain (they do not check that)
      // We could have tried the first attempt while trying to re-add all their loaders by ourselves... but there is a high chance it breaks soon since that's their internal stuff (https://github.com/vercel/next.js/blob/d3e3f28b418a408d865cd7cde255af888739da45/packages/next/build/webpack/config/blocks/css/index.ts used at https://github.com/vercel/next.js/blob/d3e3f28b418a408d865cd7cde255af888739da45/packages/next/build/webpack/config/index.ts#L49)
      const originalRules = config.module.rules;
      const styleRegex = new RegExp('(scss|sass)', 'i');
      for (const originalRule of originalRules) {
        if (originalRule.oneOf) {
          for (const ruleItem of originalRule.oneOf) {
            if (ruleItem.test && styleRegex.test(ruleItem.test.toString())) {
              originalRule.oneOf.splice(0, 0, {
                test: /\.(scss|sass)$/,
                resourceQuery: /raw/, // foo.scss?raw
                type: 'asset/source',
                use: [
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
              });

              break;
            }
          }
        }
      }

      config.module.rules.push({
        test: /\.woff2$/,
        type: 'asset/resource',
      });

      config.module.rules.push({
        test: /\.(txt|html)$/i,
        use: 'raw-loader',
      });

      config.module.rules.push({
        test: /\.ya?ml$/i,
        use: 'yaml-loader',
      });

      config.module.rules.push({
        test: /\.lexical$/i,
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
