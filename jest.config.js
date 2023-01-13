module.exports = {
  rootDir: 'src',
  globalSetup: '../scripts/jestGlobalSetup.js',
  globalTeardown: '../scripts/jestGlobalTearDown.js',
  testMatch: ['<rootDir>/tests/**/*.js', '<rootDir>/plugins/tests/**/*.js'],
  testPathIgnorePatterns: [
    '<rootDir>/tests/contracts',
    '<rootDir>/tests/mockFiles',
    '<rootDir>/tests/testHelper.js',
    '<rootDir>/tests/mockModels.js',
    '<rootDir>/tests/externalApiResponse.mock.js'
  ],
  collectCoverageFrom: ['<rootDir>/rest/services/**'],
  coveragePathIgnorePatterns: [
    '<rootDir>/rest/services/eth/',
    '<rootDir>/rest/services/cronjob/',
    '<rootDir>/rest/services/helpers/hardhatTasks.js',
    '<rootDir>/rest/services/helpers/hardhatClaimTasks.js',
    '<rootDir>/rest/services/helpers/hardhatProjectTasks.js',
    '<rootDir>/rest/services/helpers/hardhatTaskHelpers.js',
    '<rootDir>/rest/services/helper.js',
    '<rootDir>/rest/services/helpers/emailClient.js'
  ],
  testTimeout: 60000
};
