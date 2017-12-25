/* eslint comma-dangle: 0 */

module.exports = {
  'name': 'memory-storage-jest',
  'jest': {
    'verbose': true
  },
  'collectCoverage': true,
  'coveragePathIgnorePatterns': [
    'node_modules',
    '_storage',
    'fixtures'
  ]
};
