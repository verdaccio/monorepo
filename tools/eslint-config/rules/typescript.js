module.exports = {
  extends: ['plugin:@typescript-eslint/eslint-recommended', 'plugin:@typescript-eslint/recommended'],
  rules: {
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/indent': ['error', 2],
    '@typescript-eslint/explicit-member-accessibility': ['warn'],
  },
};
