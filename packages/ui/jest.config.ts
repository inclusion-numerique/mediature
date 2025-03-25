import { getTsconfig } from 'get-tsconfig';
import { pathsToModuleNameMapper } from 'ts-jest';

const fullTsconfig = getTsconfig();
if (!fullTsconfig) {
  throw new Error(`a "tsconfig.json" must be provided`);
}

// Add any custom config to be passed to Jest
const customJestConfig = {
  preset: 'ts-jest',
  setupFilesAfterEnv: [],
  moduleDirectories: ['node_modules', '<rootDir>/'],
  moduleNameMapper:
    fullTsconfig.config.compilerOptions && fullTsconfig.config.compilerOptions.paths
      ? pathsToModuleNameMapper(fullTsconfig.config.compilerOptions.paths, { prefix: '<rootDir>/' })
      : undefined,
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  transform: {
    '\\.tsx?$': [
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

// Since the command `test:unit` is nested multiple times (turbo, makefile...) it's impossible
// to pass the `--max-workers` parameter from the CI/CD pipeline. So hacking a bit by defining a custom environment variable
// since Jest has none (https://jestjs.io/docs/environment-variables)
// Note: it cannot be set to undefined directly into the config object because Jest would take it due to the object key existing, so using a separate condition
if (typeof process.env.JEST_MAX_WORKERS === 'string') {
  (customJestConfig as any).maxWorkers = parseInt(process.env.JEST_MAX_WORKERS, 10);
}

export default customJestConfig;
