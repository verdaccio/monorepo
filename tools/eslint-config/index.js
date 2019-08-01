module.exports = {
  extends: ['./rules/base', './rules/typescript', './rules/import', './rules/prettier'].map(require.resolve),
  env: {
    es6: true,
    node: true,
    jest: true,
  },
  globals: {
    __APP_VERSION__: true,
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2019,
    ecmaFeatures: {
      impliedStrict: true,
      jsx: true,
    },
  },
};
