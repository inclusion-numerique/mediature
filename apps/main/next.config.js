const cssnano = require('cssnano');
const path = require('path');
const tsImport = require('ts-import');

const { commonPackages } = require('./transpilePackages');

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
const CopyWebpackPlugin = require('copy-webpack-plugin');
const gitRevision = require('git-rev-sync');
const { getCommitSha, getHumanVersion, getTechnicalVersion } = require('./src/utils/app-version.js');
const { convertHeadersForNextjs, securityHeaders, assetsSecurityHeaders } = require('./src/utils/http.js');
const { i18n } = require('./next-i18next.config');

const mode = process.env.APP_MODE || 'test';

const nextjsSecurityHeaders = convertHeadersForNextjs(securityHeaders);
const nextjsAssetsSecurityHeaders = convertHeadersForNextjs(assetsSecurityHeaders);
const baseUrl = new URL(getBaseUrl());

// TODO: once Next supports `next.config.js` we can set types like `ServerRuntimeConfig` and `PublicRuntimeConfig` below
const moduleExports = async () => {
  const appHumanVersion = await getHumanVersion();

  let standardModuleExports = {
    reactStrictMode: true,
    swcMinify: true,
    output: 'standalone', // To debug locally the `next start` it's easier to comment this line (it will avoid using `prepare-standalone.sh` + `node`)
    env: {
      // Those will replace `process.env.*` with hardcoded values (useful when the value is calculated during the build time)
      SENTRY_RELEASE_TAG: appHumanVersion,
    },
    serverRuntimeConfig: {},
    publicRuntimeConfig: {
      appMode: mode,
      appVersion: appHumanVersion,
    },
    i18n: i18n,
    eslint: {
      ignoreDuringBuilds: true, // Skip since already done in a specific step of our CI/CD
    },
    typescript: {
      ignoreBuildErrors: true, // Skip since already done in a specific step of our CI/CD
    },
    transpilePackages: commonPackages,
    experimental: {
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
      // Order matters, less precise to more precise (it's weird since the opposite of others... but fine)
      return [
        {
          source: '/:path*', // All routes
          headers: nextjsSecurityHeaders,
        },
        {
          source: '/assets/:path*', // Assets routes
          headers: nextjsAssetsSecurityHeaders,
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
      // Expose all DSFR fonts as static at the root so emails and PDFs can download them when needed
      config.plugins.push(
        new CopyWebpackPlugin({
          patterns: [
            {
              from: path.dirname(require.resolve('@gouvfr/dsfr/dist/fonts/Marianne-Bold.woff2')),
              to: path.resolve(__dirname, './public/assets/fonts/'),
            },
            {
              from: require.resolve('@mediature/ui/src/fonts/index.css'),
              to: path.resolve(__dirname, './public/assets/fonts/'),
            },
            {
              from: path.dirname(require.resolve('@mediature/ui/src/emails/images/twitter.png')),
              to: path.resolve(__dirname, './public/assets/images/email/social/'),
            },
          ],
        })
      );

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

  const uploadToSentry = process.env.SENTRY_RELEASE_UPLOAD === 'true' && process.env.NODE_ENV === 'production';

  const sentryWebpackPluginOptions = {
    dryRun: !uploadToSentry,
    debug: false,
    silent: false,
    release: appHumanVersion,
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

  return withSentryConfig(standardModuleExports, sentryWebpackPluginOptions, {
    transpileClientSDK: true,
    // tunnelRoute: '/monitoring', // Helpful to avoid adblockers, but requires Sentry SaaS
    hideSourceMaps: false,
    disableLogger: false,
  });
};

module.exports = moduleExports;
