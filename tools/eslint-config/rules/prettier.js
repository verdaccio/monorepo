module.exports = {
  extends: ['plugin:prettier/recommended', 'prettier/@typescript-eslint'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
        singleQuote: true
      }
    ]
  }
};
