/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@clearring/shared-types$': '<rootDir>/../../../packages/shared-types/src',
    '^@clearring/phone-utils$': '<rootDir>/../../../packages/phone-utils/src',
    '^@clearring/spam-engine$': '<rootDir>/../../../packages/spam-engine/src',
    '^@clearring/config$': '<rootDir>/../../../packages/config/src',
  },
};
