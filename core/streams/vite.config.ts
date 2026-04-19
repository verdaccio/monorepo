import { resolve } from 'path';
import { defineConfig } from 'vitest/config';
import dts from 'vite-plugin-dts';

export default defineConfig({
  oxc: {
    tsconfig: {
      configFile: resolve(__dirname, 'tsconfig.build.json'),
    },
  },
  test: {
    include: ['test/**/*.spec.ts'],
    globals: false,
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['cjs'],
      fileName: () => 'index.js',
    },
    outDir: 'lib',
    rollupOptions: {
      external: [/^node:/, 'stream'],
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
