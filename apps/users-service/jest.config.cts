/* eslint-disable */
const { readFileSync } = require('fs');

// Reading the SWC compilation config for the spec files
const swcJestConfig = JSON.parse(
  readFileSync(`${__dirname}/.spec.swcrc`, 'utf-8'),
);

// Disable .swcrc look-up by SWC core because we're passing in swcJestConfig ourselves
swcJestConfig.swcrc = false;

module.exports = {
  displayName: '@orbit/users-service',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['@swc/jest', swcJestConfig],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  moduleNameMapper: {
    // Resolve workspace libs to their TS source; strip their nodenext ".js" import suffixes.
    '^@orbit/shared-auth$': '<rootDir>/../../libs/shared-auth/src/index.ts',
    '^@orbit/shared-types$': '<rootDir>/../../libs/shared-types/src/index.ts',
    '^@orbit/nest-common$': '<rootDir>/../../libs/nest-common/src/index.ts',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  coverageDirectory: 'test-output/jest/coverage',
};
