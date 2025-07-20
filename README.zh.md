# i18n-scanner-toolkit

[![npm version](https://badge.fury.io/js/i18n-scanner-toolkit.svg)](https://badge.fury.io/js/i18n-scanner-toolkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

> 中文文档 | [English](./README.md)

现代化的 TypeScript 优先国际化扫描器和翻译管理工具包，适用于 JavaScript/TypeScript 项目。

## 功能特性

- **智能文本提取** - 自动扫描并提取代码库中的可翻译文本
- **缺失翻译检测** - 识别多语言环境中未翻译的内容
- **CSV 导出/导入** - 通过 CSV 文件支持无缝翻译工作流
- **自定义模式支持** - 支持自定义函数如 `$LS()`、`t()`、`$t()` 等
- **框架无关** - 支持 React、Vue、Angular 和原生 JavaScript/TypeScript
- **零依赖** - 轻量级，单文件分发
- **TypeScript 优先** - 完整的 TypeScript 支持和全面的类型定义

## 安装

```bash
npm install --save-dev i18n-scanner-toolkit
# 或者
yarn add --dev i18n-scanner-toolkit
# 或者
pnpm add --save-dev i18n-scanner-toolkit
```

## 快速开始

### 基础用法

```javascript
const { I18nScanner } = require('i18n-scanner-toolkit');

const config = {
  framework: 'custom',
  sourceDir: 'src',
  localeDir: 'src/localized/strings',
  extractPattern: /\$LS\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/g,
  ignoreKeyPatterns: ['src', 'components']
};

const scanner = new I18nScanner(config);

// 1. 扫描缺失的翻译
const missingTranslations = await scanner.scanAll();
console.log(missingTranslations);
// 输出: { "key1": "text1", "key2": "text2" }

// 2. 导出到 CSV
const csvPath = await scanner.export();
console.log(`导出到: ${csvPath}`);

// 3. 从 CSV 导入（手动翻译后）
await scanner.import('./translations.csv');
```

## 配置

### 框架预设

```javascript
// React 配合 react-i18next
const config = {
  framework: 'react',
  sourceDir: 'src',
  localeDir: 'src/locales',
  extractPattern: /t\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/g
};

// Vue 配合 vue-i18n
const config = {
  framework: 'vue',
  sourceDir: 'src',
  localeDir: 'src/locales',
  extractPattern: /\$t\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/g
};

// 自定义模式（如 $LS 函数）
const config = {
  framework: 'custom',
  sourceDir: 'src',
  localeDir: 'src/localized/strings',
  extractPattern: /\$LS\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/g,
  ignoreKeyPatterns: ['src', 'components']
};
```

### 配置选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `framework` | `string` | `'custom'` | 框架预设：`'react'`、`'vue'`、`'angular'`、`'custom'` |
| `sourceDir` | `string` | `'src'` | 扫描源文件的目录 |
| `localeDir` | `string` | `'src/locales'` | 包含语言文件的目录 |
| `extractPattern` | `RegExp` | - | 提取可翻译文本的正则表达式 |
| `extensions` | `string[]` | `['js', 'jsx', 'ts', 'tsx']` | 要扫描的文件扩展名 |
| `ignoreDirs` | `string[]` | `['node_modules', '.git', 'dist']` | 要忽略的目录 |
| `ignoreKeyPatterns` | `string[]` | `[]` | 生成键时要忽略的模式 |
| `defaultLocale` | `string` | `'en.js'` | 默认语言文件 |

### 框架特定配置示例

#### React (配合 react-i18next)
```javascript
const config = {
  framework: 'react',
  projectDir: './',
  sourceDir: 'src',
  localeDir: 'src/locales',
  extensions: ['js', 'jsx', 'ts', 'tsx'],
  ignoreDirs: ['node_modules', '.git', 'dist', 'build', '.next'],
  ignoreKeyPatterns: ['components', 'utils', 'common', 'hooks'],
  defaultLocale: 'en.json',
  extractPattern: /\bt\s*\(\s*['"`]([^'"`]+)['"`]/g
};
```

#### Vue (配合 vue-i18n)
```javascript
const config = {
  framework: 'vue',
  projectDir: './',
  sourceDir: 'src',
  localeDir: 'src/locales',
  extensions: ['vue', 'js', 'ts'],
  ignoreDirs: ['node_modules', '.git', 'dist', 'build'],
  ignoreKeyPatterns: ['components', 'utils', 'common', 'composables'],
  defaultLocale: 'zh-CN.json',
  extractPattern: /\$t\s*\(\s*['"`]([^'"`]+)['"`]/g
};
```

#### Angular (配合 ngx-translate)
```javascript
const config = {
  framework: 'angular',
  projectDir: './',
  sourceDir: 'src',
  localeDir: 'src/assets/i18n',
  extensions: ['ts', 'html'],
  ignoreDirs: ['node_modules', '.git', 'dist', 'build'],
  ignoreKeyPatterns: ['components', 'services', 'shared'],
  defaultLocale: 'en.json',
  extractPattern: /translate\.(?:get|instant)\s*\(\s*['"`]([^'"`]+)['"`]/g
};
```

#### 自定义模式
```javascript
const config = {
  framework: 'custom',
  projectDir: './',
  sourceDir: 'src',
  localeDir: 'src/localized/strings',
  extensions: ['js', 'jsx', 'ts', 'tsx'],
  ignoreDirs: ['node_modules', '.git', 'dist', 'build'],
  ignoreKeyPatterns: ['src', 'components'],
  defaultLocale: 'zh_hans.js',
  extractPattern: /\$LS\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g
};
```

## API 参考

### I18nScanner

#### `new I18nScanner(config)`

使用指定配置创建新的扫描器实例。

#### `scanner.scanAll()`

扫描所有文件并返回缺失翻译的 JSON 对象。

```javascript
const missing = await scanner.scanAll();
// 返回: { "HomePage101": "欢迎", "Button102": "点击我" }
```

#### `scanner.export(filePath?)`

将所有翻译导出到 CSV 文件。返回文件路径。

```javascript
const csvPath = await scanner.export('./translations.csv');
// 创建: lang_bulid_20250720_143022.csv
```

#### `scanner.import(filePath)`

从 CSV 文件导入翻译并更新语言文件。

```javascript
await scanner.import('./translations.csv');
```

## 工作流程

### 1. 开发工作流程

```javascript
// 1. 在代码中添加可翻译文本
function HomePage() {
  return <h1>{$LS("欢迎使用我们的应用")}</h1>;
}

// 2. 扫描缺失的翻译
const scanner = new I18nScanner(config);
const missing = await scanner.scanAll();

// 3. 导出到 CSV 进行翻译
await scanner.export('./translations.csv');

// 4. 在 Excel/CSV 编辑器中翻译
// 5. 导入回来更新语言文件
await scanner.import('./translations.csv');
```

### 2. CSV 格式

导出的 CSV 文件遵循以下格式：

```csv
key,en,zh_hans
HomePage101,Welcome to our app,欢迎使用我们的应用
Button102,Click me,点击我
Navigation103,,导航
```

- 第一列：生成的键
- 后续列：语言代码
- 空单元格：缺失的翻译

## 示例

查看 [demo-project](./demo-project/react) 获取使用自定义 `$LS()` 函数的完整 React 示例。

## TypeScript 支持

完整的 TypeScript 支持和全面的类型定义：

```typescript
import { I18nScanner, I18nConfig, ScanResult } from 'i18n-scanner-toolkit';

const config: I18nConfig = {
  framework: 'react',
  sourceDir: 'src',
  localeDir: 'src/locales'
};

const scanner = new I18nScanner(config);
const result: Record<string, string> = await scanner.scanAll();
```

## 许可证

MIT 许可证 - 详见 [LICENSE](./LICENSE) 文件。

## 贡献

欢迎贡献！请阅读我们的贡献指南并向我们的仓库提交拉取请求。
