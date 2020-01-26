module.exports = {
  extends: ['plugin:prettier/recommended', 'prettier/@typescript-eslint'],
  rules: {
    curly: ['error', 'all'],
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
        printWidth: 120,
        tabWidth: 2,
        useTabs: false,
        semi: true,
        trailingComma: 'es5',
        singleQuote: true,
        bracketSpacing: true,
      },
    ],
  },
};
