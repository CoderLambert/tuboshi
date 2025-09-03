import type { NextConfig } from 'next';
import { codeInspectorPlugin } from 'code-inspector-plugin';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';

export default (phase: string): NextConfig => {
  const commonConfig: NextConfig = {
    // 转换这些包以确保老浏览器兼容性
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

    // 确保需要转换的包被正确处理，排除有问题的包
    config.module.rules.forEach((rule: any) => {
      // 找到 SWC 或 Babel 规则
      if (rule.use && Array.isArray(rule.use)) {
        rule.use.forEach((useItem: any) => {
          // 处理 SWC loader
          if (useItem.loader && useItem.loader.includes('swc-loader')) {
            // 确保 SWC 处理我们需要转换的包
            const originalInclude = useItem.options?.include;
            useItem.options = useItem.options || {};

            // 明确包含需要转换的包
            if (!originalInclude) {
              useItem.options.include = [
                /node_modules[\/\\]js-cookie/,
                /node_modules[\/\\]i18next/,
                /node_modules[\/\\]zustand/,
                /node_modules[\/\\]react-i18next/,
                /node_modules[\/\\]html-parse-stringify/,
              ];
            }
          }

          // 处理 Babel loader
          if (useItem.loader && useItem.loader.includes('babel-loader')) {
            // 扩展排除规则，但不排除我们需要转换的包
            useItem.options = useItem.options || {};
            useItem.options.exclude = [
              // 排除大部分 node_modules，但不排除我们需要的包
              /node_modules[\/\\](?!(js-cookie|i18next|zustand|react-i18next|html-parse-stringify))/,
              // 明确排除有问题的包
              /node_modules[\/\\]marked/,
              /node_modules[\/\\]mermaid/,
              /node_modules[\/\\]langium/,
              /node_modules[\/\\]estree-util-is-identifier-name/,
              /node_modules[\/\\]@remixicon/,
              /node_modules[\/\\]cytoscape/,
              /node_modules[\/\\]katex/,
            ];
          }
        });
      }

      // 处理单个 loader 的情况
      if (rule.use && typeof rule.use === 'string') {
        if (rule.use.includes('babel-loader')) {
          rule.exclude = [
            // 排除大部分 node_modules，但不排除我们需要的包
            /node_modules[\/\\](?!(js-cookie|i18next|zustand|react-i18next|html-parse-stringify))/,
          ];
        }
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


