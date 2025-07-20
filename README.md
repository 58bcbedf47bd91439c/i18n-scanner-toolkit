# i18n-scanner-toolkit

[![npm version](https://badge.fury.io/js/i18n-scanner-toolkit.svg)](https://badge.fury.io/js/i18n-scanner-toolkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

> [中文文档](./README.zh.md) | English

A modern, TypeScript-first internationalization scanner and translation management toolkit for JavaScript/TypeScript projects.

## Features

- **Smart Text Extraction** - Automatically scan and extract translatable text from your codebase
- **Missing Translation Detection** - Identify untranslated content across multiple languages  
- **CSV Export/Import** - Seamless translation workflow with CSV file support
- **Custom Pattern Support** - Works with custom functions like `$LS()`, `t()`, `$t()`, etc.
- **Framework Agnostic** - Supports React, Vue, Angular, and vanilla JavaScript/TypeScript
- **Zero Dependencies** - Lightweight, single-file distribution
- **TypeScript First** - Full TypeScript support with comprehensive type definitions

## Installation

```bash
npm install --save-dev i18n-scanner-toolkit
# or
yarn add --dev i18n-scanner-toolkit
# or
pnpm add --save-dev i18n-scanner-toolkit
```

## Quick Start

### Basic Usage

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

// 1. Scan for missing translations
const missingTranslations = await scanner.scanAll();
console.log(missingTranslations);
// Output: { "key1": "text1", "key2": "text2" }

// 2. Export to CSV
const csvPath = await scanner.export();
console.log(`Exported to: ${csvPath}`);

// 3. Import from CSV (after manual translation)
await scanner.import('./translations.csv');
```

## Configuration

### Framework Presets

```javascript
// React with react-i18next
const config = {
  framework: 'react',
  sourceDir: 'src',
  localeDir: 'src/locales',
  extractPattern: /t\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/g
};

// Vue with vue-i18n
const config = {
  framework: 'vue',
  sourceDir: 'src',
  localeDir: 'src/locales',
  extractPattern: /\$t\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/g
};

// Custom pattern (like $LS function)
const config = {
  framework: 'custom',
  sourceDir: 'src',
  localeDir: 'src/localized/strings',
  extractPattern: /\$LS\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/g,
  ignoreKeyPatterns: ['src', 'components']
};
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `framework` | `string` | `'custom'` | Framework preset: `'react'`, `'vue'`, `'angular'`, `'custom'` |
| `sourceDir` | `string` | `'src'` | Directory to scan for source files |
| `localeDir` | `string` | `'src/locales'` | Directory containing language files |
| `extractPattern` | `RegExp` | - | Regular expression to extract translatable text |
| `extensions` | `string[]` | `['js', 'jsx', 'ts', 'tsx']` | File extensions to scan |
| `ignoreDirs` | `string[]` | `['node_modules', '.git', 'dist']` | Directories to ignore |
| `ignoreKeyPatterns` | `string[]` | `[]` | Patterns to ignore when generating keys |
| `defaultLocale` | `string` | `'en.js'` | Default language file |

### Framework-Specific Configuration Examples

#### React (with react-i18next)
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

#### Vue (with vue-i18n)
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

#### Angular (with ngx-translate)
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

#### Custom Pattern
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

## API Reference

### I18nScanner

#### `new I18nScanner(config)`

Creates a new scanner instance with the specified configuration.

#### `scanner.scanAll()`

Scans all files and returns missing translations as a JSON object.

```javascript
const missing = await scanner.scanAll();
// Returns: { "HomePage101": "Welcome", "Button102": "Click me" }
```

#### `scanner.export(filePath?)`

Exports all translations to a CSV file. Returns the file path.

```javascript
const csvPath = await scanner.export('./translations.csv');
// Creates: lang_bulid_20250720_143022.csv
```

#### `scanner.import(filePath)`

Imports translations from a CSV file and updates language files.

```javascript
await scanner.import('./translations.csv');
```

## Workflow

### 1. Development Workflow

```javascript
// 1. Add translatable text in your code
function HomePage() {
  return <h1>{$LS("Welcome to our app")}</h1>;
}

// 2. Scan for missing translations
const scanner = new I18nScanner(config);
const missing = await scanner.scanAll();

// 3. Export to CSV for translation
await scanner.export('./translations.csv');

// 4. Translate in Excel/CSV editor
// 5. Import back to update language files
await scanner.import('./translations.csv');
```

### 2. CSV Format

The exported CSV file follows this format:

```csv
key,en,zh_hans
HomePage101,Welcome to our app,欢迎使用我们的应用
Button102,Click me,点击我
Navigation103,,导航
```

- First column: Generated key
- Following columns: Language codes
- Empty cells: Missing translations

## Examples

See the [demo-project](./demo-project/react) for a complete React example with custom `$LS()` function.

## TypeScript Support

Full TypeScript support with comprehensive type definitions:

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

## License

MIT License - see [LICENSE](./LICENSE) file for details.

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our repository.
