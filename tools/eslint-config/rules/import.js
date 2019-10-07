module.exports = {
  extends: ['plugin:import/errors', 'plugin:import/warnings', 'plugin:import/typescript'],
  rules: {
    'import/order': ['error', { 'newlines-between': 'always' }],
  },
};
