import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/cli.ts'),
      name: 'I18nToolkitScannerCLI',
      formats: ['cjs'],
      fileName: () => 'cli.js',
    },
    rollupOptions: {
      external: [
        'chalk',
        'commander',
        'cosmiconfig',
        'fast-glob',
        'fs-extra',
        'inquirer',
        'xlsx',
        'fs',
        'path',
        'os',
        'util',
        'events',
        'stream',
        'buffer',
        'crypto',
        'url',
        'querystring',
        // Reference to main library
        '../index.js',
      ],
      output: {
        globals: {
          chalk: 'chalk',
          commander: 'commander',
          cosmiconfig: 'cosmiconfig',
          'fast-glob': 'fastGlob',
          'fs-extra': 'fsExtra',
          inquirer: 'inquirer',
          xlsx: 'XLSX',
        },
      },
    },
    outDir: 'dist',
    sourcemap: true,
    minify: false,
    target: 'node14',
  },
});
