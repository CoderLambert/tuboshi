import type { NextConfig } from 'next'
import { codeInspectorPlugin } from 'code-inspector-plugin'
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants' // 导入 phase 常量

export default (phase: string): NextConfig => {
  // 定义通用的 webpack 配置
  const webpackConfig = (config: any) => {
    // 为 react-markdown 添加特殊处理
    config.resolve.alias = {
      ...config.resolve.alias,
    }

    // 添加 markdown 文件处理规则
    config.module.rules.push({
      test: /\.md$/,
      use: 'raw-loader',
    })

    return config
  }

  // 只在开发模式下应用 Turbopack 配置
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return {
      // turbopack: {
      //   rules: codeInspectorPlugin({
      //     bundler: 'turbopack',  // 开发模式下使用 Turbopack
      //   }),
      // },
      output: 'standalone', // 可选：开发模式下也保持 standalone（但实际 dev 不影响）
      webpack: (config: any) => {
        webpackConfig(config)
        config.plugins.push(codeInspectorPlugin({ bundler: 'webpack', editor: 'code' }))
        return config
      },
    }
  }

  // 在构建模式下，不应用 Turbopack（使用默认 Webpack）
  return {
    basePath: '/ai-chat/aa',
    assetPrefix: '/ai-chat/aa',
    output: 'standalone', // 只保留必要的生产配置
    webpack: webpackConfig,
  }
}
