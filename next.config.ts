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

  const isStaticExport = process.env.STATIC_EXPORT === '1'

  const baseConfig = {
    basePath: process.env.NEXT_PUBLIC_NODE_BASE_PATH,
    images: { unoptimized: true },
    // Static hosting serves the export folder as /tubo-app/.
    ...(isStaticExport ? { output: 'export' as const, trailingSlash: true } : {}),
  }

  // 只在开发模式下应用 Turbopack 配置
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return {
      ...baseConfig,
      ...(isStaticExport ? {} : { output: 'standalone' as const }),
      webpack: (config: any) => {
        webpackConfig(config)
        config.plugins.push(codeInspectorPlugin({ bundler: 'webpack', editor: 'code' }))
        return config
      },
    }
  }

  // 在构建模式下，不应用 Turbopack（使用默认 Webpack）
  return {
    ...baseConfig,
    ...(isStaticExport ? {} : { output: 'standalone' as const }),
    webpack: webpackConfig,
    eslint: {
      // Warning: This allows production builds to successfully complete even if
      // your project has ESLint errors.
      ignoreDuringBuilds: true,
      dirs: ['app', 'config', 'components', 'hooks', 'i18n', 'lib', 'services', 'test', 'types', 'utils'],
    },
    typescript: {
      ignoreBuildErrors: true,
    },
    compiler: {
      removeConsole: {
        exclude: ['error'],
      },
    }
  }
}
