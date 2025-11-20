# 浏览器兼容性配置

本文档说明了项目中为确保老浏览器兼容性而进行的配置。

## 问题描述

在构建过程中，某些第三方包（如 `js-cookie`、`i18next`、`zustand`、`react-i18next`）使用了现代 JavaScript 语法：

- **`??`** - Nullish Coalescing Operator (空值合并操作符)
- **`?.`** - Optional Chaining Operator (可选链操作符)

这些语法在老版本浏览器中不被支持，需要进行转换。

## 解决方案

### 1. Next.js 配置 (`next.config.ts`)

```typescript
transpilePackages: [
  // 需要转换现代语法的包
  'js-cookie',
  'i18next',
  'zustand',
  'react-i18next',
  'html-parse-stringify',
  'void-elements',
  // 包含相关的子依赖
  '@formatjs/intl-localematcher',
  'use-context-selector'
],
```

### 2. SWC 配置 (`.swcrc`)

```json
{
  "jsc": {
    "target": "es5",
    "parser": {
      "nullishCoalescing": true,
      "optionalChaining": true
    }
  },
  "env": {
    "targets": {
      "chrome": "60",
      "firefox": "55", 
      "safari": "11",
      "edge": "16"
    },
    "include": [
      "transform-nullish-coalescing-operator",
      "transform-optional-chaining"
    ]
  }
}
```

### 3. Browserslist 配置 (`package.json`)

```json
"browserslist": [
  "chrome >= 60",
  "firefox >= 55",
  "safari >= 11", 
  "edge >= 16"
]
```

### 4. Babel 配置 (`.babelrc`)

```json
{
  "plugins": [
    "@babel/plugin-transform-optional-chaining",
    "@babel/plugin-transform-nullish-coalescing-operator"
  ]
}
```

## 验证方法

### 自动检查脚本

运行以下命令检查构建后的文件是否还包含现代语法：

```bash
# 构建并检查
pnpm build:check

# 或者分别运行
pnpm build
pnpm check:transpilation
```

### 手动检查

1. 构建项目：`pnpm build`
2. 检查 `.next/static/chunks/` 目录下的 JS 文件
3. 搜索 `??` 和 `?.` 符号
4. 如果找到，说明转换未生效

## 支持的浏览器版本

| 浏览器 | 最低版本 | 现代语法支持版本 |
|--------|----------|------------------|
| Chrome | 60+ | 80+ |
| Firefox | 55+ | 72+ |
| Safari | 11+ | 13.1+ |
| Edge | 16+ | 80+ |

## 常见问题

### Q: 为什么有些包没有被转换？

A: 检查以下几点：
1. 包是否在 `transpilePackages` 中
2. SWC/Babel 配置是否正确
3. 是否有冲突的配置

### Q: 如何添加新的需要转换的包？

A: 在 `next.config.ts` 的 `transpilePackages` 数组中添加包名。

### Q: 构建后仍然有现代语法怎么办？

A: 运行 `pnpm check:transpilation` 查看具体问题，然后：
1. 确认包在 `transpilePackages` 中
2. 检查 webpack 配置是否正确排除/包含了相关包
3. 验证 SWC 配置是否生效

## 相关文件

- `next.config.ts` - Next.js 主配置
- `.swcrc` - SWC 编译器配置  
- `.babelrc` - Babel 编译器配置
- `package.json` - Browserslist 配置
- `scripts/check-transpilation.js` - 验证脚本
