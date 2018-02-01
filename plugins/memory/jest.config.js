/* eslint comma-dangle: 0 */

module.exports = {
  name: 'memory-storage-jest',
  jest: {
    verbose: true
  },
  testRegex: '(/test/.*\\.spec)\\.js',
  collectCoverage: true,
  coveragePathIgnorePatterns: ['node_modules', '_storage', 'fixtures']
};
