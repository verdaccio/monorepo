module.exports = {
  extends: ['plugin:import/typescript'],
  rules: {
    'import/order': ['error', { 'newlines-between': 'always' }],
  },
  plugins: ['import'],
};
