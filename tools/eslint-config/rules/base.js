module.exports = {
  extends: ['eslint:recommended', 'google'],
  rules: {
    'keyword-spacing': 'off',
    'no-tabs': 'off',
    'no-useless-escape': 'off',
    'padded-blocks': 'off',
    'require-jsdoc': 'off',
    'valid-jsdoc': 'off',

    'eol-last': 'warn',
    'no-irregular-whitespace': 'warn',
    'no-mixed-spaces-and-tabs': ['warn', 'smart-tabs'],
    'no-trailing-spaces': 'warn',

    camelcase: 'off',
    curly: 'error',
    'guard-for-in': 'error',
    'handle-callback-err': 'error',
    'new-cap': 'error',
    'max-len': ['warn', 160],
    'no-console': ['error', { allow: ['warn'] }],
    'no-constant-condition': 'error',
    'no-debugger': 'error',
    'no-empty': 'error',
    'no-fallthrough': 'error',
    'no-invalid-this': 'error',
    'no-new-require': 'error',
    'no-undef': 'error',
    'no-unreachable': 'error',
    'no-unused-vars': ['error', { vars: 'all', args: 'none' }],
    'no-var': 'error',
    'one-var': 'error',
    'prefer-rest-params': 'warn',
    'prefer-spread': 'warn',
    semi: ['error', 'always']
  }
};
