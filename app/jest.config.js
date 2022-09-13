/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

module.exports = {
  clearMocks: true,
  collectCoverage: false,
  coverageProvider: 'v8',
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      tsConfig: {
        isolatedModules: false,
      },
    },
  },
  testEnvironment: 'jsdom',
}
