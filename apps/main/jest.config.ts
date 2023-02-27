import { getTsconfig } from 'get-tsconfig';
import nextJest from 'next/jest';
import { pathsToModuleNameMapper } from 'ts-jest';

const createJestConfig = nextJest({
  dir: './',
});

const fullTsconfig = getTsconfig();
if (!fullTsconfig) {
  throw new Error(`a "tsconfig.json" must be provided`);
}

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
  transform: {
    '\\.[jt]sx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react',
        },
      },
    ],
    '\\.lexical$': '@glen/jest-raw-loader',
  },
};

export default createJestConfig(customJestConfig);
