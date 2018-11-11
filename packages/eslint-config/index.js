module.exports = {
  extends: [
    "eslint:recommended",
    "google",
    "plugin:react/recommended",
    "plugin:flowtype/recommended",
    "plugin:jest/recommended",
    "plugin:prettier/recommended"
  ],
  parser: 'babel-eslint',
  plugins: [
    'react',
    'babel',
    'flowtype',
    'jest'
  ],
  "env": {
    "browser": true,
    "node": true,
    "es6": true,
    "jest": true
  },
  'parserOptions': {
    'sourceType': 'module',
    'ecmaVersion': 7,
    'ecmaFeatures': {
      'modules': true,
      'impliedStrict': true,
      'jsx': true
    }
  },
  'settings': {
    'react': {
      'pragma': 'React',  // Pragma to use
      'version': '16.4.2', // React version
      'flowVersion': '0.81.0' // Flow version
    }
  },
  rules: {
    'prettier/prettier': ['error', null, '@prettier'],
    'babel/no-invalid-this': 1,
    'no-useless-escape': 2,
    'no-invalid-this': 0,
    'react/no-deprecated': 1,
    'react/jsx-no-target-blank': 1,
    'handle-callback-err': 2,
    'no-fallthrough': 2,
    'no-new-require': 2,
    'max-len': [2, 160],
    'camelcase': 0,
    'require-jsdoc': 0,
    'valid-jsdoc': 0,
    'prefer-spread': 1,
    'prefer-rest-params': 1,
    'linebreak-style': 0,
    'quote-props':['error', 'as-needed']
  }
};
