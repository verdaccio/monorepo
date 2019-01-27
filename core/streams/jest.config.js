/* eslint comma-dangle: 0 */

module.exports = {
  'name': 'verdaccio-streams',
  'moduleFileExtensions': [
    'ts',
    'tsx',
    'js',
    'jsx'
  ],
  'transform': {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
  },
  'verbose': true,
  'collectCoverage': true,
  'coveragePathIgnorePatterns': [
    'node_modules',
    'fixtures'
  ]
};
