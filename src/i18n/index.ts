export const i18n = {
  defaultLocale: 'en', // app 传递
  locales: ['en', 'zh-Hans'],
} as const

export type Locale = typeof i18n['locales'][number]
