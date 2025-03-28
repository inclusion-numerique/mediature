import dotenv from 'dotenv';
import { getTsconfig } from 'get-tsconfig';
import nextJest from 'next/jest';
import path from 'path';
import { pathsToModuleNameMapper } from 'ts-jest';

import { additionalJestPackages, commonPackages, formatTransformIgnorePatterns } from './transpilePackages';

const createJestConfig = nextJest({
  dir: './',
});

const fullTsconfig = getTsconfig();
if (!fullTsconfig) {
  throw new Error(`a "tsconfig.json" must be provided`);
}

// Load test variables if any
dotenv.config({ path: path.resolve(__dirname, './.env.jest') });
dotenv.config({ path: path.resolve(__dirname, './.env.jest.local') });

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: [],
  moduleDirectories: ['node_modules', '<rootDir>/'],
  moduleNameMapper: {
    '^.+\\.(scss)\\?raw$': '<rootDir>/src/fixtures/rawStyleMock.ts', // `createJestConfig` mocks all styles with `{}` but not our specific `?raw` so we do (note order over other mappers matters)
    ...(fullTsconfig.config.compilerOptions && fullTsconfig.config.compilerOptions.paths
      ? pathsToModuleNameMapper(fullTsconfig.config.compilerOptions.paths, { prefix: '<rootDir>/' })
      : {}),
  },
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  transformIgnorePatterns: [],
  transform: {
    '\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react',
        },
      },
    ] as any, // Casting is needed because `createJestConfig()` expects a string, and the alternative of setting the parameter as `globals` is deprecated
    '\\.lexical$': '@glen/jest-raw-loader',
  },
};

// [WORKAROUND] To transpile additional dependencies we hack a bit as specified into https://github.com/vercel/next.js/discussions/31152#discussioncomment-1697047
// (and we add our own logic to avoid hardcoding values)
const asyncConfig = createJestConfig(customJestConfig);

const defaultExport = async () => {
  const config = await asyncConfig();

  config.transformIgnorePatterns = formatTransformIgnorePatterns(
    [...commonPackages, ...additionalJestPackages],
    customJestConfig.transformIgnorePatterns ?? []
  );

  // Since the command `test:unit` is nested multiple times (turbo, makefile...) it's impossible
  // to pass the `--max-workers` parameter from the CI/CD pipeline. So hacking a bit by defining a custom environment variable
  // since Jest has none (https://jestjs.io/docs/environment-variables)
  // Note: it cannot be set to undefined directly into the config object because Jest would take it due to the object key existing, so using a separate condition
  if (typeof process.env.JEST_MAX_WORKERS === 'string') {
    (config as any).maxWorkers = parseInt(process.env.JEST_MAX_WORKERS, 10);
  }

  return config;
};

export default defaultExport;
