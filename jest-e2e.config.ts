// jest-e2e.config.js (for E2E Tests)
import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],

  // Match only .e2e-spec.ts files for E2E tests
  testMatch: [
    '**/*.e2e-spec.ts', // Match e2e tests
  ],

  coverageDirectory: './coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.module.ts',
    '!src/main.ts',
  ],

  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1', // Resolve 'src/' to './src/'
  },

  // If you have a separate tsconfig for e2e tests, you can specify it here
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json', // Or 'tsconfig.json' if using the same tsconfig
    },
  },
};

export default config;
