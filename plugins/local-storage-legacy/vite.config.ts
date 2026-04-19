import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  oxc: {
    tsconfig: {
      configFile: resolve(__dirname, 'tsconfig.build.json'),
    },
  },
  test: {
    include: ['tests/**/*.test.ts'],
    globals: false,
    oxc: {
      tsconfig: {
        configFile: resolve(__dirname, 'tsconfig.json'),
      },
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['cjs'],
      fileName: () => 'index.js',
    },
    outDir: 'lib',
    rollupOptions: {
      external: [
        /^node:/,
        /^@verdaccio\//,
        'debug',
        'fs',
        'globby',
        'path',
        'lodash',
        'lowdb',
        'lowdb/adapters/FileAsync',
        'lowdb/adapters/Memory',
        'mkdirp',
        'sanitize-filename',
        'stream',
      ],
      output: {
        exports: 'named',
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
    sourcemap: true,
    minify: false,
  },
  plugins: [
    dts({
      include: ['src/**/*.ts'],
      outDir: 'lib',
      tsconfigPath: resolve(__dirname, 'tsconfig.build.json'),
    }),
  ],
});
