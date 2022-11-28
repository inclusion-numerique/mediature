import { getTsconfig } from 'get-tsconfig';
import nextJest from 'next/jest';
import { pathsToModuleNameMapper } from 'ts-jest';

const createJestConfig = nextJest({
  dir: './',
});

const fullTsconfig = getTsconfig();

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: [],
  moduleDirectories: ['node_modules', '<rootDir>/'],
  moduleNameMapper: pathsToModuleNameMapper(fullTsconfig.config.compilerOptions.paths, { prefix: '<rootDir>/' }),
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react',
      },
    },
  },
};

export default createJestConfig(customJestConfig);
