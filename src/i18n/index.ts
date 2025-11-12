export const i18n = {
  defaultLocale: 'en', // app 传递
  locales: ['en', 'zh-Hans', 'pt'], // 英语、中文、葡萄牙语
} as const

export type Locale = typeof i18n['locales'][number]
