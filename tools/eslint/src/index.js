/* eslint-disable no-undef */
import js from '@eslint/js';
import vitest from '@vitest/eslint-plugin';
import prettier from 'eslint-config-prettier';
import cypress from 'eslint-plugin-cypress';
import importX from 'eslint-plugin-import-x';
import jest from 'eslint-plugin-jest';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import verdaccioPlugin from 'eslint-plugin-verdaccio';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export const reactConfig = defineConfig([
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
    },
  },
]);

export const vitestConfig = defineConfig([
  {
    files: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],
    plugins: { vitest },
    rules: {
      ...vitest.configs.recommended.rules,
    },
  },
]);

export const jestConfig = defineConfig([
  {
    files: [
      '**/*.{test,spec}.{js,ts,jsx,tsx}',
      '**/tests/**/*.{js,ts,jsx,tsx}',
      '**/test/**/*.{js,ts,jsx,tsx}',
      '**/__tests__/**/*.{js,ts,jsx,tsx}',
      '**/__mocks__/**/*.{js,ts,jsx,tsx}',
      '**/jest*.*',
    ],
    plugins: { jest },
    languageOptions: {
      globals: globals.jest,
    },
    rules: {
      ...jest.configs.recommended.rules,
    },
  },
]);

export const cypressConfig = defineConfig([
  {
    files: ['cypress/**/*.{js,ts,jsx,tsx}'],
    plugins: { cypress },
    rules: {
      ...cypress.configs.recommended.rules,
    },
  },
]);

const verdaccioRecommended = verdaccioPlugin.configs.recommended;
export const verdaccioConfig = defineConfig(
  Array.isArray(verdaccioRecommended) ? verdaccioRecommended : [verdaccioRecommended]
);

export default defineConfig([
  // ---------------------------------------------
  // Global ignores
  // ---------------------------------------------
  globalIgnores([
    '**/__fixtures__/**',
    '**/partials/**',
    '**/dist/**',
    '**/lib/**',
    '**/build/**',
    '**/node_modules/**',
  ]),

  // ---------------------------------------------
  // Base JS rules
  // ---------------------------------------------
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  js.configs.recommended,

  // ---------------------------------------------
  // TypeScript rules
  // ---------------------------------------------
  ...tseslint.configs.recommended,

  // ---------------------------------------------
  // Main project rules
  // ---------------------------------------------
  {
    files: ['**/*.{ts,tsx}'],

    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      parser: tseslint.parser,

      parserOptions: {
        project: true,
        tsconfigRootDir: process.cwd(),
      },

      globals: {
        ...globals.node,
        ...globals.browser,
        __APP_VERSION__: 'readonly',
      },
    },

    plugins: {
      'import-x': importX,
    },

    settings: {
      'import-x/resolver': {
        typescript: true,
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },

    rules: {
      curly: ['error', 'all'],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'prefer-const': 'error',
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      'no-var': 'error',
      'guard-for-in': 'error',

      'import-x/no-duplicates': 'error',
      'import-x/no-unresolved': 'off',
      'import-x/order': 'off',

      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-require-imports': 'warn',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // ---------------------------------------------
  // Disable type-checked rules for test files
  // (test files are often excluded from tsconfig)
  // ---------------------------------------------
  {
    files: [
      '**/*.{test,spec}.{ts,tsx}',
      '**/tests/**/*.{ts,tsx}',
      '**/test/**/*.{ts,tsx}',
      '**/__tests__/**/*.{ts,tsx}',
    ],
    languageOptions: {
      parserOptions: {
        project: null,
        program: null,
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
    },
  },

  // ---------------------------------------------
  // Prettier (must be last)
  // ---------------------------------------------
  prettier,
]);
