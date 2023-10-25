/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

module.exports = {
  clearMocks: true,
  collectCoverage: false,
  coverageProvider: 'v8',
  preset: 'ts-jest',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          isolatedModules: false,
        },
      },
    ],
  },
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup-jest.ts'],
  testMatch: ['<rootDir>/__tests__/**/*.test.ts?(x)'],
}
