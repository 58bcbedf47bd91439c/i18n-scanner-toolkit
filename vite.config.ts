import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      include: ['src/**/*'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
      outDir: 'dist',
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'I18nToolkitScanner',
      formats: ['es', 'cjs'],
      fileName: (format) => {
        if (format === 'es') return 'index.esm.js';
        if (format === 'cjs') return 'index.js';
        return `index.${format}.js`;
      },
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
      ],
      output: {
        // 禁用代码分割，生成单一文件
        manualChunks: undefined,
        inlineDynamicImports: true,
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
    minify: false, // Keep readable for debugging
    target: 'node14',
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,ts}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'src/**/*.d.ts',
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
      ],
    },
  },
});
