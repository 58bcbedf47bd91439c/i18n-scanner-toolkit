# React i18n 演示项目

> 中文文档 | [English](./README.md)

这是一个完整的 React 演示项目，展示了如何使用自定义的 `$LS()` 函数进行国际化，以及 `i18n-scanner-toolkit` 如何检测和管理这些翻译。

## 功能特性

### 自定义国际化系统
- **$LS() 函数** - 自定义的国际化函数，直接使用文本值
- **Redux 集成** - 使用 Redux Toolkit 管理语言状态
- **HOC 模式** - 高阶组件包装模式 (HOCDemo)
- **Hook 模式** - 自定义 Hook 模式 (HookDemo)
- **零 i18n 依赖** - 不依赖 react-i18next，完全自定义实现

### 演示内容
- **语言切换** - 实时切换中英文
- **多种使用模式** - 展示不同的 i18n 使用方式
- **缺失翻译** - 故意添加的缺失翻译，用于演示扫描器功能

## 项目结构

```
src/
├── components/           # React 组件
│   ├── LanguageSwitcher.jsx  # 语言切换器
│   ├── HOCDemo.jsx          # HOC 模式演示
│   └── HookDemo.jsx         # Hook 模式演示
├── pages/
│   └── HomePage.jsx         # 主页面
├── redux/                # Redux 状态管理
│   ├── store.js
│   └── languageSlice.js
├── utils/
│   └── LS.js               # 自定义 $LS 函数
├── hooks/
│   └── useTranslationI18n.js  # 自定义 Hook
├── localized/            # 国际化相关
│   ├── hoc.js              # 高阶组件
│   ├── util.js             # 工具函数
│   └── strings/            # 语言文件
│       ├── zh_hans.js      # 中文
│       └── en.js           # 英文
└── App.jsx               # 主应用
```

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建项目
pnpm build

# 代码检查
pnpm lint
```

## 依赖说明

### 生产依赖
- **react** & **react-dom** - React 核心
- **react-redux** & **@reduxjs/toolkit** - 状态管理
- **lucide-react** - 图标库

### 开发依赖
- **vite** & **@vitejs/plugin-react** - 构建工具
- **eslint** & **eslint-plugin-react** - 代码检查
- **i18n-scanner-toolkit** - 国际化扫描工具

### 移除的依赖
- ❌ **react-i18next** - 使用自定义 $LS 系统替代
- ❌ **i18next** - 不再需要
- ❌ **react-router-dom** - 简化为单页面演示

## 使用 i18n-scanner-toolkit

### 扫描项目

```javascript
// 使用扫描器编程接口
const { I18nScanner } = require('i18n-scanner-toolkit');

const config = {
  framework: 'custom',
  sourceDir: 'src',
  localeDir: 'src/localized/strings',
  extractPattern: /\$LS\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/g,
  ignoreKeyPatterns: ['src', 'components']
};

const scanner = new I18nScanner(config);

// 1. 获取缺失翻译
const missing = await scanner.scanAll();
console.log(missing);

// 2. 导出到 CSV
const csvPath = await scanner.export();

// 3. 从 CSV 导入（翻译后）
await scanner.import('./translations.csv');
```

### 配置文件

项目包含 `i18n-scanner.config.json` 配置文件：

```json
{
  "framework": "custom",
  "extractPattern": "\\$LS\\s*\\(\\s*['\"`]([^'\"`]+)['\"`]\\s*\\)",
  "localeDir": "src/localized/strings",
  "defaultLocale": "zh_hans.js"
}
```

## 自定义 $LS() 模式

### 特殊设计：直接使用文本值

与传统的 i18n 库不同，这个项目的 `$LS()` 函数**直接使用文本值**而不是 key：

```javascript
// 传统方式：使用 key
t('navigation.home')  // 需要在语言文件中定义 "navigation.home": "首页"

// $LS 方式：直接使用文本
$LS('首页')  // 直接使用中文文本，语言文件中定义 "首页": "Home"
```

### 为什么选择这种方式？

1. **开发者友好** - 无需思考 key 名称
2. **自文档化** - 代码显示实际文本内容
3. **回退就绪** - 如果翻译缺失，显示原始文本
4. **扫描器友好** - 易于用正则表达式检测和提取

### 使用模式

#### 1. HOC 模式 (HOCDemo 组件)
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

#### 2. Hook 模式 (HookDemo 组件)
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

#### 3. 语言文件结构
```javascript
// zh_hans.js (中文)
export const message = {
    "首页": "首页",
    "关于": "关于",
    "登录": "登录"
}

// en.js (英文)
export const message = {
    "首页": "Home",
    "关于": "About",
    "登录": "Login"
}
```

## 扫描器检测内容

扫描器会检测以下内容：

### ✅ 已翻译文本
- `$LS("首页")` - 在所有语言文件中存在
- `$LS("登录")` - 完整翻译
- `$LS("成功！")` - 状态消息

### ❌ 缺失翻译
- `$LS("这个文本在英文翻译中缺失")` - 仅在中文文件中存在
- `$LS("另一个缺失的文本")` - 完全缺失
- `"Hardcoded text"` - 硬编码文本，应该使用 $LS()

### 📈 统计信息
- 扫描的文件数量
- 提取的文本数量
- 缺失翻译数量
- 翻译覆盖率百分比

## 扫描器优势

1. **自动检测** - 无需手动配置，自动识别 $LS() 模式
2. **详细报告** - 生成 CSV 报告，包含文件位置和建议的翻译键
3. **多种格式** - 支持 CSV、JSON 输出
4. **零配置** - 开箱即用，智能检测项目结构
5. **自定义模式** - 支持各种自定义 i18n 函数模式

## 演示效果

1. **启动项目** - 看到中英文切换效果
2. **运行扫描** - 查看检测到的缺失翻译
3. **生成报告** - 获得详细的 CSV 报告
4. **修复翻译** - 根据报告补充缺失的翻译

## 相关链接

- [主要文档](../../README.zh.md)
- [English Documentation](../../README.md)
- [i18n-scanner-toolkit](https://www.npmjs.com/package/i18n-scanner-toolkit)
