import verdaccio from '@verdaccio/eslint-config';

export default [
  ...verdaccio,
  {
    ignores: ['**/dist/**', '**/node_modules/**'],
  },
];
