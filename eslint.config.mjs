import {
  GLOB_TESTS, combine, javascript, node,
  stylistic, typescript, unicorn,
} from '@antfu/eslint-config'
import globals from 'globals'
import tailwind from 'eslint-plugin-tailwindcss'
import reactHooks from 'eslint-plugin-react-hooks'
import sonar from 'eslint-plugin-sonarjs'

export default combine(
  // 基础样式配置
  stylistic({
    lessOpinionated: true,
    jsx: false, // @antfu/eslint-config 不支持 jsx
    semi: false,
    quotes: 'single',
    overrides: {
      // 基础样式规则
      'style/indent': ['error', 2],
      'style/quotes': ['error', 'single'],
      'style/comma-spacing': ['error', { before: false, after: true }],
      'style/quote-props': ['warn', 'consistent-as-needed'],
      'style/brace-style': ['error', 'stroustrup', { allowSingleLine: true }],
      'style/dot-location': ['error', 'property'],
      'style/object-curly-newline': ['error', { consistent: true, multiline: true }],
      'style/object-property-newline': ['error', { allowAllPropertiesOnSameLine: true }],
      'style/template-curly-spacing': ['error', 'never'],

      // 关闭可能冲突或不需要的规则
      'style/indent-binary-ops': 'off',
      'style/multiline-ternary': 'off',
      'style/keyword-spacing': 'off',
      'style/member-delimiter-style': 'off',
      'style/max-statements-per-line': 'off',

      // 关闭 antfu 特定规则
      'antfu/top-level-function': 'off',
      'antfu/curly': 'off',
      'antfu/consistent-chaining': 'off',
      'antfu/consistent-list-newline': 'off',
    },
  }),
  // JavaScript 基础配置
  javascript({
    overrides: {
      'no-unused-vars': 'off', // 由 unused-imports 处理
    },
  }),

  // TypeScript 配置
  typescript({
    overrides: {
      'ts/consistent-type-definitions': ['warn', 'type'],
      'ts/no-empty-object-type': 'off',
      'ts/ban-ts-comment': 'off', // 允许 @ts-expect-error 不带描述
      'ts/no-require-imports': 'off',
      'ts/no-use-before-define': 'off', // 允许函数声明提升
    },
  }),

  // Unicorn 和 Node.js 规则
  unicorn(),
  node(),
  // 忽略文件配置
  {
    ignores: [
      '**/node_modules/*',
      '**/dist/',
      '**/build/',
      '**/out/',
      '**/.next/',
      '**/public/*',
      '**/*.json',
    ],
  },

  // Next.js 性能优化
  {
    rules: {
      '@next/next/no-html-link-for-pages': 'off', // 性能问题，且未使用
    },
  },

  // 主要规则配置
  {
    rules: {
      // 基础规则
      'no-console': 'off',
      'camelcase': 'off',
      'default-case-last': 'error',
      'no-cond-assign': 'off', // 允许在条件中赋值
      'no-new': 'off', // 允许 new 用于副作用
      'no-empty-function': 'off', // 允许空函数作为占位符

      // 数组回调规则
      'array-callback-return': ['error', {
        allowImplicit: false,
        checkForEach: false,
      }],

      // 导入排序 - 保持原有配置避免大量变更
      'sort-imports': ['error', {
        ignoreCase: false,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
        allowSeparatedGroups: false,
      }],

      // 未使用变量和导入
      'unused-imports/no-unused-vars': 'warn',
      'unused-imports/no-unused-imports': 'warn',

      // React 相关
      'react/display-name': 'off',
      'react-hooks/exhaustive-deps': 'warn',

      // Node.js 相关
      'node/prefer-global/process': 'off',
      'node/prefer-global/buffer': 'off',
      'node/no-callback-literal': 'off',

      // Unicorn 规则调整
      'unicorn/prefer-number-properties': 'warn',
      'unicorn/no-new-array': 'warn',
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2025,
        ...globals.node,
        React: 'readable',
        JSX: 'readable',
      },
    },
  },
  // React Hooks 配置
  {
    rules: reactHooks.configs.recommended.rules,
    plugins: {
      'react-hooks': reactHooks,
    },
  },

  // SonarJS 代码质量规则
  {
    rules: {
      ...sonar.configs.recommended.rules,

      // 代码复杂度控制
      'sonarjs/cognitive-complexity': 'off', // 认知复杂度检查
      'sonarjs/no-nested-functions': 'warn',
      'sonarjs/no-nested-conditional': 'warn',
      'sonarjs/nested-control-flow': 'warn', // 最多3层嵌套
      'sonarjs/no-small-switch': 'off',
      'sonarjs/regex-complexity': 'warn',

      // 可维护性
      'sonarjs/no-ignored-exceptions': 'off',
      'sonarjs/no-commented-code': 'warn',
      'sonarjs/no-unused-vars': 'warn',
      'sonarjs/prefer-single-boolean-return': 'warn',
      'sonarjs/no-nested-template-literals': 'warn',
      'sonarjs/no-dead-store': 'warn',
      'sonarjs/no-duplicated-branches': 'warn',
      'sonarjs/max-lines': 'warn', // 最大1000行
      'sonarjs/no-variable-usage-before-declaration': 'error',
      'sonarjs/todo-tag': 'warn',

      // 安全相关 - 开发环境放宽
      'sonarjs/no-clear-text-protocols': 'off', // 允许 http 用于开发
      'sonarjs/no-hardcoded-passwords': 'off',
      'sonarjs/no-hardcoded-secrets': 'off',
      'sonarjs/pseudo-random': 'off',

      // 性能相关
      'sonarjs/slow-regex': 'warn',

      // 其他规则关闭
      'sonarjs/redundant-type-aliases': 'off',
      'sonarjs/duplicates-in-character-class': 'off',
      'sonarjs/single-char-in-character-classes': 'off',
      'sonarjs/anchor-precedence': 'warn',
      'sonarjs/updated-loop-counter': 'off',
      'sonarjs/table-header': 'off',
      'sonarjs/single-character-alternation': 'off',
      'sonarjs/constructor-for-side-effects': 'off',
    },
    plugins: {
      sonarjs: sonar,
    },
  },
  // 测试文件配置
  {
    files: GLOB_TESTS,
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
        ...globals.jest,
      },
    },
  },

  // Tailwind CSS 配置
  tailwind.configs['flat/recommended'],
  {
    settings: {
      tailwindcss: {
        callees: ['classnames', 'clsx', 'ctl', 'cn'],
        config: 'tailwind.config.js',
        cssFiles: [
          '**/*.css',
          '!**/node_modules',
          '!**/.*',
          '!**/dist',
          '!**/build',
          '!**/.next',
          '!**/.public',
        ],
        cssFilesRefreshRate: 5_000,
        removeDuplicates: true,
        skipClassAttribute: false,
        whitelist: [],
        tags: [],
        classRegex: '^class(Name)?$',
      },
    },
    rules: {
      // 性能优化 - 关闭耗时规则
      'tailwindcss/no-contradicting-classname': 'off',
      'tailwindcss/enforces-shorthand': 'off',
      'tailwindcss/no-custom-classname': 'off',
      'tailwindcss/no-unnecessary-arbitrary-value': 'off',
      'tailwindcss/no-arbitrary-value': 'off',

      // 保留有用的规则
      'tailwindcss/classnames-order': 'warn',
      'tailwindcss/enforces-negative-arbitrary-values': 'warn',
      'tailwindcss/migration-from-tailwind-2': 'warn',
    },
  },
)
