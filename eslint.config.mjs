import verdaccio from '@verdaccio/eslint-config';

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

export default [...verdaccio, ...ignores];
