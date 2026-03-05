import verdaccio, { jestConfig } from '@verdaccio/eslint-config';

const ignores = [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.turbo/**',
      '**/.next/**',
      '**/.output/**',
      '**/.vercel/**',
      '**/*.min.js',
      '**/*.d.ts',
    ],
  },
];

const testFilePatterns = [
  '**/*.{test,spec}.{js,ts,jsx,tsx}',
  '**/tests/**/*.{ts,tsx}',
  '**/test/**/*.{ts,tsx}',
  '**/__tests__/**/*.{ts,tsx}',
  '**/__mocks__/**/*.{ts,tsx}',
];

export default [
  ...verdaccio,
  ...jestConfig,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-this-alias': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-misused-promises': 'warn',
      'preserve-caught-error': 'warn',
    },
  },
  {
    files: testFilePatterns,
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
    },
  },
  {
    files: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],
    rules: {
      'jest/no-done-callback': 'off',
      'jest/no-conditional-expect': 'off',
      'jest/no-mocks-import': 'off',
      'jest/no-standalone-expect': 'warn',
    },
  },
  ...ignores,
];
