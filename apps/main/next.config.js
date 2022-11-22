const path = require('path');

module.exports = {
  reactStrictMode: true,
  // output: 'standalone', // This was great to use in case of a Docker image, but it's totally incompatible with Scalingo build pipeline, giving up this size reducing way :D
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../../'),
    transpilePackages: ['ui'],
  },
};
