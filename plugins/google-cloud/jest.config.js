/* eslint comma-dangle: 0 */

module.exports = {
  name: 'verdaccio-google-cloud-jest',
  moduleDirectories: ['node_modules', 'src'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
  },
  verbose: true,
  collectCoverage: true,
  coveragePathIgnorePatterns: ['node_modules', 'partials', 'lib']
};
