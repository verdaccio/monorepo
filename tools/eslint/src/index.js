/* eslint-disable no-undef */
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import importX from 'eslint-plugin-import-x';
import vitest from '@vitest/eslint-plugin';
import cypress from 'eslint-plugin-cypress';
import prettier from 'eslint-config-prettier';

import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

import { defineConfig, globalIgnores } from 'eslint/config';

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

export const cypressConfig = defineConfig([
  {
    files: ['cypress/**/*.{js,ts,jsx,tsx}'],
    plugins: { cypress },
    rules: {
      ...cypress.configs.recommended.rules,
    },
  },
]);

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
      'import-x/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-require-imports': 'warn',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // ---------------------------------------------
  // Test files — Vitest
  // ---------------------------------------------
  {
    files: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],
    plugins: { vitest },
    rules: {
      ...vitest.configs.recommended.rules,
    },
  },

  // ---------------------------------------------
  // Prettier (must be last)
  // ---------------------------------------------
  prettier,
]);
