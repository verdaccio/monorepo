module.exports = {
  name: 'memory-storage-jest',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  testPathIgnorePatterns: ['lib'],
  verbose: true,
  collectCoverage: true,
  coveragePathIgnorePatterns: ['node_modules', 'lib'],
};
