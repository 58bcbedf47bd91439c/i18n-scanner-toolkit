# React i18n Demo Project

> [中文文档](./README.zh.md) | English

A complete React demonstration project showcasing how to use a custom `$LS()` function for internationalization and how `i18n-scanner-toolkit` detects and manages these translations.

## Features

### Custom Internationalization System
- **$LS() Function** - Custom internationalization function using text values directly
- **Redux Integration** - Language state management with Redux Toolkit
- **HOC Pattern** - Higher-Order Component wrapper pattern (HOCDemo)
- **Hook Pattern** - Custom Hook pattern (HookDemo)
- **Zero i18n Dependencies** - No dependency on react-i18next, completely custom implementation

### Demo Content
- **Language Switching** - Real-time switching between Chinese and English
- **Multiple Usage Patterns** - Demonstrates different i18n usage approaches
- **Missing Translations** - Intentionally added missing translations to demonstrate scanner functionality

## Project Structure

```
src/
├── components/           # React components
│   ├── LanguageSwitcher.jsx  # Language switcher
│   ├── HOCDemo.jsx          # HOC pattern demo
│   └── HookDemo.jsx         # Hook pattern demo
├── pages/
│   └── HomePage.jsx         # Main page
├── redux/                # Redux state management
│   ├── store.js
│   └── languageSlice.js
├── utils/
│   └── LS.js               # Custom $LS function
├── hooks/
│   └── useTranslationI18n.js  # Custom Hook
├── localized/            # Internationalization related
│   ├── hoc.js              # Higher-order component
│   ├── util.js             # Utility functions
│   └── strings/            # Language files
│       ├── zh_hans.js      # Chinese
│       └── en.js           # English
└── App.jsx               # Main application
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build project
pnpm build

# Lint code
pnpm lint
```

## Dependencies

### Production Dependencies
- **react** & **react-dom** - React core
- **react-redux** & **@reduxjs/toolkit** - State management
- **lucide-react** - Icon library

### Development Dependencies
- **vite** & **@vitejs/plugin-react** - Build tools
- **eslint** & **eslint-plugin-react** - Code linting
- **i18n-scanner-toolkit** - Internationalization scanner

### Removed Dependencies
- ❌ **react-i18next** - Replaced with custom $LS system
- ❌ **i18next** - No longer needed
- ❌ **react-router-dom** - Simplified to single-page demo

## Using i18n-scanner-toolkit

### Scan Project

```javascript
// Using the scanner programmatically
const { I18nScanner } = require('i18n-scanner-toolkit');

const config = {
  framework: 'custom',
  sourceDir: 'src',
  localeDir: 'src/localized/strings',
  extractPattern: /\$LS\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/g,
  ignoreKeyPatterns: ['src', 'components']
};

const scanner = new I18nScanner(config);

// 1. Get missing translations
const missing = await scanner.scanAll();
console.log(missing);

// 2. Export to CSV
const csvPath = await scanner.export();

// 3. Import from CSV (after translation)
await scanner.import('./translations.csv');
```

### Configuration File

The project includes an `i18n-scanner.config.json` configuration file:

```json
{
  "framework": "custom",
  "extractPattern": "\\$LS\\s*\\(\\s*['\"`]([^'\"`]+)['\"`]\\s*\\)",
  "localeDir": "src/localized/strings",
  "defaultLocale": "zh_hans.js"
}
```

## Custom $LS() Pattern

### Special Design: Direct Text Values

Unlike traditional i18n libraries, this project's `$LS()` function **uses text values directly** instead of keys:

```javascript
// Traditional approach: using keys
t('navigation.home')  // Requires defining "navigation.home": "Home" in language files

// $LS approach: direct text usage
$LS('首页')  // Uses Chinese text directly, language file defines "首页": "Home"
```

### Why This Approach?

1. **Developer Friendly** - No need to think of key names
2. **Self-Documenting** - The code shows actual text content
3. **Fallback Ready** - If translation is missing, original text is displayed
4. **Scanner Friendly** - Easy to detect and extract with regex patterns

### Usage Patterns

#### 1. HOC Pattern (HOCDemo Component)
```javascript
import LS from "../utils/LS.js";

const HOCDemo = ({$LS}) => {
    return (
        <div>
            <h2>{$LS("React 国际化演示")}</h2>
            <p>{$LS("首页")}</p>
        </div>
    )
}

export default LS(HOCDemo)
```

#### 2. Hook Pattern (HookDemo Component)
```javascript
import {useTranslationI18n} from "../hooks/useTranslationI18n.js";

const HookDemo = () => {
    const $LS = useTranslationI18n()
    return (
        <div>
            <h2>{$LS("演示页面")}</h2>
            <p>{$LS("切换语言")}</p>
        </div>
    )
}
```

#### 3. Language File Structure
```javascript
// zh_hans.js (Chinese)
export const message = {
    "首页": "首页",
    "关于": "关于",
    "登录": "登录"
}

// en.js (English)
export const message = {
    "首页": "Home",
    "关于": "About",
    "登录": "Login"
}
```

## Scanner Detection

The scanner detects the following content:

### ✅ Translated Text
- `$LS("首页")` - Exists in all language files
- `$LS("登录")` - Complete translation
- `$LS("成功！")` - Status messages

### ❌ Missing Translations
- `$LS("这个文本在英文翻译中缺失")` - Only exists in Chinese file
- `$LS("另一个缺失的文本")` - Completely missing
- `"Hardcoded text"` - Hardcoded text that should use $LS()

### 📈 Statistics
- Number of files scanned
- Number of texts extracted
- Number of missing translations
- Translation coverage percentage

## Scanner Advantages

1. **Automatic Detection** - No manual configuration needed, automatically recognizes $LS() patterns
2. **Detailed Reports** - Generates CSV reports with file locations and suggested translation keys
3. **Multiple Formats** - Supports CSV, JSON output
4. **Zero Configuration** - Works out of the box, intelligently detects project structure
5. **Custom Patterns** - Supports various custom i18n function patterns

## Demo Features

1. **Start Project** - See Chinese-English switching effects
2. **Run Scanner** - View detected missing translations
3. **Generate Reports** - Get detailed CSV reports
4. **Fix Translations** - Add missing translations based on reports

## Related Links

- [Main Documentation](../../README.md)
- [中文文档](../../README.zh.md)
- [i18n-scanner-toolkit](https://www.npmjs.com/package/i18n-scanner-toolkit)
