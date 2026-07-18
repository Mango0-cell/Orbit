/* eslint-disable */
const { readFileSync } = require('fs');

// Reading the SWC compilation config for the spec files
const swcJestConfig = JSON.parse(
  readFileSync(`${__dirname}/.spec.swcrc`, 'utf-8'),
);

// Disable .swcrc look-up by SWC core because we're passing in swcJestConfig ourselves
swcJestConfig.swcrc = false;

module.exports = {
  displayName: '@orbit/nest-common',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['@swc/jest', swcJestConfig],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  moduleNameMapper: {
    // Resolve the workspace lib to its TS source, and its nodenext ".js" imports back to ".ts".
    '^@orbit/shared-auth$': '<rootDir>/../shared-auth/src/index.ts',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  coverageDirectory: 'test-output/jest/coverage',
};
