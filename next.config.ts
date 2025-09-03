import type { NextConfig } from 'next';
import { codeInspectorPlugin } from 'code-inspector-plugin';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants'; // 导入 phase 常量

export default (phase: string): NextConfig => {
  // 定义通用的 webpack 配置
  const webpackConfig = (config: any) => {
    // 添加 markdown 文件处理规则
    config.module.rules.push({
      test: /\.md$/,
      use: 'raw-loader',
    });
    return config;
  };

  // 只在开发模式下应用配置
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return {
      webpack: (config: any) => {
        webpackConfig(config);
        config.plugins.push(codeInspectorPlugin({ bundler: 'webpack', editor: 'code' }));
        return config;
      },
    };
  }

  // 在构建模式下，不应用 Turbopack（使用默认 Webpack）
  return {
    output: 'standalone', // 只保留必要的生产配置
    webpack: webpackConfig,
  };
};