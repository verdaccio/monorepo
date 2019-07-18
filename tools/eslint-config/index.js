module.exports = {
  plugins: ['verdaccio', '@typescript-eslint', 'jest'],

  extends: [
    'eslint:recommended',
    'google',
    'plugin:jest/recommended',
    'plugin:prettier/recommended',
    'plugin:verdaccio/recommended',
    'plugin:@typescript-eslint/recommended'
  ],

  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 7,
    ecmaFeatures: {
      impliedStrict: true,
      jsx: true
    }
  },

  env: {
    node: true,
    es6: true,
    jest: true
  },

  globals: {
    __APP_VERSION__: true
  },

  rules: {
    'prettier/prettier': ['error', { singleQuote: true }],
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/indent': ['error', 2],
    '@typescript-eslint/explicit-member-accessibility': ['warn'],
    'no-tabs': 'off',
    'keyword-spacing': 'off',
    'padded-blocks': 'off',
    'no-useless-escape': 'off',
    'handle-callback-err': 'error',
    'no-debugger': 'error',
    'no-fallthrough': 'error',
    curly: 'error',
    'eol-last': 'warn',
    'no-irregular-whitespace': 'warn',
    'no-mixed-spaces-and-tabs': ['warn', 'smart-tabs'],
    'no-trailing-spaces': 'warn',
    'no-new-require': 'error',
    'no-undef': 'error',
    'no-unreachable': 'error',
    'no-unused-vars': [
      'error',
      {
        vars: 'all',
        args: 'none'
      }
    ],
    'max-len': ['warn', 160],
    semi: ['error', 'always'],
    camelcase: 'off',
    'require-jsdoc': 'off',
    'valid-jsdoc': 'off',
    'prefer-spread': 'warn',
    'prefer-rest-params': 'warn',
    'no-var': 'error',
    'no-constant-condition': 'error',
    'no-empty': 'error',
    'guard-for-in': 'error',
    'no-invalid-this': 'error',
    'new-cap': 'error',
    'one-var': 'error',
    'no-console': [
      'error',
      {
        allow: ['warn']
      }
    ]
  }
};
