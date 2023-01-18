const { getJestConfig } = require('@storybook/test-runner');

const defaultConfig = getJestConfig();

module.exports = {
  ...defaultConfig,
  testTimeout: 15 * 1000,
  setupFilesAfterEnv: [...defaultConfig.setupFilesAfterEnv, '<rootDir>/test-runner-jest-setup.js'],
  testEnvironmentOptions: {
    'jest-playwright': {
      ...defaultConfig['jest-playwright'],
      launchOptions: {
        headless: true,
      },
    },
  },
};
