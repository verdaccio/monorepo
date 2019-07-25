/* eslint comma-dangle: 0 */

module.exports = {
  name: 'common-api-jest',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
  },
  verbose: true,
  collectCoverage: true,
  coveragePathIgnorePatterns: ['node_modules', '_storage', 'fixtures']
};
