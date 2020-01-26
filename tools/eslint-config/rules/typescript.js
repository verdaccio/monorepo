module.exports = {
  extends: ['plugin:@typescript-eslint/eslint-recommended', 'plugin:@typescript-eslint/recommended'],
  rules: {
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/indent': ['error', 2],
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-member-accessibility': ['warn'],
    '@typescript-eslint/prefer-optional-chain': ['warn'],
    // '@typescript-eslint/prefer-nullish-coalescing': ['warn'], // FIXME define parserOptions.project to generate parserServices
    // TODO temporal fix
    '@typescript-eslint/ban-ts-ignore': 'warn',
    '@typescript-eslint/no-empty-function': 'warn',
    '@typescript-eslint/no-this-alias': 'warn',
  },
};
