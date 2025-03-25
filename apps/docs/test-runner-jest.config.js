const { getJestConfig } = require('@storybook/test-runner');

const defaultConfig = getJestConfig();

let headless = true;
process.argv.forEach(function (val, index, array) {
  if (val === '--no-headless') {
    headless = false;
  }
});

const config = {
  ...defaultConfig,
  testTimeout: 30 * 1000,
  setupFilesAfterEnv: [...defaultConfig.setupFilesAfterEnv, '<rootDir>/apps/docs/test-runner-jest-setup.js'],
  testEnvironmentOptions: {
    'jest-playwright': {
      ...defaultConfig['jest-playwright'],
      launchOptions: {
        headless: headless,
      },
    },
  },
};

// Since the command `test:e2e:storybook:command` is nested multiple times starting with `test:e2e` it's impossible
// to pass the `--max-workers` parameter from the CI/CD pipeline. So hacking a bit by defining a custom environment variable
// since Jest has none (https://jestjs.io/docs/environment-variables)
// Note: it cannot be set to undefined directly into the config object because Jest would take it due to the object key existing, so using a separate condition
if (typeof process.env.JEST_MAX_WORKERS === 'string') {
  config.maxWorkers = parseInt(process.env.JEST_MAX_WORKERS, 10);
}

module.exports = config;
