import type { NextConfig } from 'next';
import { codeInspectorPlugin } from 'code-inspector-plugin';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';

export default (phase: string): NextConfig => {
  // 通用的 Webpack 配置
  const webpackConfig = (config: any, { isServer }: { isServer: boolean }) => {
    // 为 react-markdown 添加特殊处理
    config.resolve.alias = {
      ...config.resolve.alias,
    };

    // 添加 markdown 文件处理规则
    config.module.rules.push({
      test: /\.md$/,
      use: 'raw-loader',
    });
    return config;
  };

  // 开发模式配置
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return {
      output: 'standalone',
      webpack: (config: any, { isServer }: { isServer: boolean }) => {
        config = webpackConfig(config, { isServer });
        config.plugins.push(codeInspectorPlugin({ bundler: 'webpack', editor: 'code' }));
        return config;
      },
    };
  }

  // 生产模式配置
  return {
    output: 'standalone',
    compiler: {
      removeConsole: true,
    },
    webpack: webpackConfig,
  };
};