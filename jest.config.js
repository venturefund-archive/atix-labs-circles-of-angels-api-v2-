module.exports = {
  rootDir: 'src',
  globalSetup: '../scripts/jestGlobalSetup.js',
  globalTeardown: '../scripts/jestGlobalTearDown.js',
  testMatch: ['<rootDir>/tests/**/*.js', '<rootDir>/plugins/tests/**/*.js'],
  testPathIgnorePatterns: [
    '<rootDir>/tests/contracts',
    '<rootDir>/tests/mockFiles',
    '<rootDir>/tests/testHelper.js',
    '<rootDir>/tests/mockModels.js'
  ],
  collectCoverageFrom: ['<rootDir>/rest/services/**'],
  coveragePathIgnorePatterns: [
    '<rootDir>/rest/services/eth/',
    '<rootDir>/rest/services/cronjob/',
    '<rootDir>/rest/services/helpers/buidlerTasks.js',
    '<rootDir>/rest/services/helper.js',
    '<rootDir>/rest/services/helpers/emailClient.js'
  ],
  testTimeout: 60000
};
