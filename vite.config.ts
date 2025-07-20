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
      rollupTypes: true, // 合并所有类型声明到单个文件
      bundledPackages: ['papaparse'], // 打包 papaparse 类型
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'I18nToolkitScanner',
      formats: ['cjs'], // 只构建 CJS 版本，减少文件数量
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: [
        'chalk',
        'commander',
        'cosmiconfig',
        'fast-glob',
        'fs-extra',
        'inquirer',
        'papaparse',
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
          papaparse: 'Papa',
        },
      },
    },
    outDir: 'dist',
    sourcemap: false, // 禁用 source maps 减少文件大小
    minify: 'terser', // 启用压缩
    target: 'node14',
    terserOptions: {
      compress: {
        drop_console: true, // 移除 console.log
        drop_debugger: true, // 移除 debugger
      },
      mangle: {
        keep_fnames: true, // 保持函数名，便于调试
      },
    },
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
