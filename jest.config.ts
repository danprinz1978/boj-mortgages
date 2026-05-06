import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  testRegex: '.*\\.spec\\.ts$', // Look for files ending with .spec.ts
  coverageDirectory: './coverage',
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.module.ts', '!src/main.ts'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1', // Resolves 'src/' alias to './src/'
  },
};

export default config;
