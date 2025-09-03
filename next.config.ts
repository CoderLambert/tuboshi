import type { NextConfig } from 'next';
import { codeInspectorPlugin } from 'code-inspector-plugin';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';

export default (phase: string): NextConfig => {
  const commonConfig: NextConfig = {
    // 转换这些包以确保老浏览器兼容性
    transpilePackages: [
      // 基础包
      'js-cookie',
      'i18next',
      'zustand',
      'react-i18next',
      'html-parse-stringify',
      'void-elements',
      '@formatjs/intl-localematcher',
      'use-context-selector',

      // 工具库
      'lodash-es',
      'clsx',
      'tailwind-merge',
      'class-variance-authority',
      'immer',
      '@babel/runtime',

      // SVG 和图形库
      '@svgdotjs/svg.js',

      // 音频处理
      'lamejs',
      'js-audio-recorder',

      // UI 组件库
      'rc-input',
      'rc-textarea',
      'rc-resize-observer',
      'rc-util',
      '@floating-ui/utils',
      '@floating-ui/core',
      '@floating-ui/dom',
      '@floating-ui/react',

      // Markdown 相关
      'react-markdown',
      'remark-gfm',
      'remark-math',
      'remark-breaks',
      'rehype-katex',
      'rehype-raw',
      'mdast-util-math',
      'mdast-util-gfm',
      'mdast-util-from-markdown',
      'mdast-util-to-hast',
      'mdast-util-to-markdown',
      'micromark-extension-math',
      'micromark-extension-gfm',
      'micromark',
      'unified',
      'vfile',

      // 其他工具
      'web-namespaces',
      'copy-to-clipboard',
      'react-hotkeys-hook',
      'ahooks',
      'tabbable'
    ],

    // 将有问题的包标记为外部包，避免服务端处理问题
    serverExternalPackages: [
      'marked',
      'mermaid',
      '@remixicon/react',
      'cytoscape',
      'katex',
      'langium',
      'estree-util-is-identifier-name'
    ],

    // 启用生产环境 Source Map 用于调试
    productionBrowserSourceMaps: true,

    // 使用 SWC 编译器，配置兼容 Chrome 60
    compiler: {
      removeConsole: false, // 暂时保留 console 用于调试
      styledComponents: {
        ssr: true,
        pure: true,
      },
    },

    // 强制使用 SWC
    experimental: {
      forceSwcTransforms: true, // 强制使用 SWC
    },
    // ESLint 配置 - 构建时不因 ESLint 错误而失败
    eslint: {
      // 构建时忽略 ESLint 错误，可通过环境变量 SKIP_LINT=false 来启用
      ignoreDuringBuilds: process.env.SKIP_LINT !== 'false',
    },
    // TypeScript 配置
    typescript: {
      // 构建时忽略 TypeScript 错误（如果需要）
      ignoreBuildErrors: false,
    },

    // 确保兼容性
    env: {
      BROWSERSLIST_ENV: 'production'
    }
  };

  const webpackConfig = (config: any) => {
    // 处理 Markdown 文件
    config.module.rules.push({
      test: /\.md$/,
      use: 'raw-loader',
    });

    // 处理 .mjs 文件
    config.resolve.extensions = ['.mjs', '.js', '.jsx', '.ts', '.tsx'];
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    });

    // 强制 SWC 转换所有现代语法
    config.module.rules.forEach((rule: any) => {
      if (rule.use && Array.isArray(rule.use)) {
        rule.use.forEach((useItem: any) => {
          // 处理 SWC loader
          if (useItem.loader && useItem.loader.includes('swc-loader')) {
            useItem.options = useItem.options || {};

            // 强制设置 SWC 配置
            useItem.options.jsc = {
              target: 'es5',
              loose: true,
              parser: {
                syntax: 'typescript',
                tsx: true,
                decorators: true,
                dynamicImport: true,
                nullishCoalescing: true,
                optionalChaining: true,
                privateMethod: true,
                functionBind: true,
                exportDefaultFrom: true,
                exportNamespaceFrom: true,
                importMeta: true
              },
              transform: {
                react: {
                  runtime: 'automatic'
                }
              },
              externalHelpers: false,
              keepClassNames: true
            };

            // 强制设置环境配置
            useItem.options.env = {
              targets: {
                chrome: '60',
                firefox: '55',
                safari: '11',
                edge: '16'
              },
              mode: 'usage',
              coreJs: '3',
              include: [
                'transform-nullish-coalescing-operator',
                'transform-optional-chaining',
                'transform-logical-assignment-operators',
                'transform-numeric-separator',
                'transform-class-properties',
                'transform-private-methods',
                'transform-private-property-in-object',
                'transform-class-static-block',
                'transform-export-namespace-from',
                'transform-dynamic-import'
              ]
            };

            useItem.options.module = { type: 'es6' };
            useItem.options.minify = false;
          }
        });
      }
    });

    return config;
  };

  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return {
      ...commonConfig,
      webpack: (config: any) => {
        webpackConfig(config);
        config.plugins.push(codeInspectorPlugin({ bundler: 'webpack', editor: 'code' }));
        return config;
      },
    };
  }

  return {
    ...commonConfig,
    output: 'standalone',
    typescript: {
      ignoreBuildErrors: true,
    },
    webpack: webpackConfig,
  };
};


