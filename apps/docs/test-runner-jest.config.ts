import { getJestConfig } from '@storybook/test-runner';
import type { Config } from 'jest';

import { userAgentNameToBeDetected } from '@mediature/docs/.storybook/testing';

const defaultConfig = getJestConfig();

const config: Config = {
  ...defaultConfig,
  testEnvironmentOptions: {
    'jest-playwright': {
      ...(defaultConfig as any)['jest-playwright'],
      contextOptions: {
        userAgent: userAgentNameToBeDetected,
      },
    },
  },
};

export default config;
