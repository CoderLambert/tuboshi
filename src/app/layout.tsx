// import { getLocaleOnServer } from '@/i18n/server'
import { Suspense } from 'react'
import { Geist } from 'next/font/google'
import '@/styles/tailwind.css'
import '@/styles/markdown.css'
import '@/styles/markdown.scss'
import I18nProvider from '@/app/components/I18nProvider'
import PhoneBoot from '@/demo/PhoneBoot'
import DemoChrome from '@/demo/DemoChrome'
import { USERID_COOKIE_NAME } from '@/config'
import Cookies from 'js-cookie'
// import { testTransformFaqContentWithZod } from '@/lib/utils'
export const metadata = {
  title: 'Courier AI Assistant · Demo',
  description: 'A chat application powered by AI agents',
  other: {
    // 禁用移动端浏览器的下拉刷新
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
  },
}
const geist = Geist({
  subsets: ['latin'],
})

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover', // For iOS safe areas
  // interactiveWidget: 'resizes-content', // 让视口随键盘调整（Chrome/Android支持）
}
// testTransformFaqContentWithZod()
const LocaleLayout = async ({
  children,
}: {
  children: React.ReactNode
}) => {
  Cookies.remove(USERID_COOKIE_NAME)
  return (
    <html className={`${geist.className} h-full overflow-hidden`} style={{
      // Rem root for the 750-wide design scale. Body below pins inherited text to 16px
      // so unstyled fallbacks are not blown up to ~100px inside a phone iframe.
      'fontSize': '100px',
      '--tpx': '0.01rem',
    } as React.CSSProperties} suppressHydrationWarning>
      <body className="h-full overflow-hidden" style={{ fontSize: '16px' }} suppressHydrationWarning>
        <div className="px-safe-left pr-safe-right pt-safe-top pb-safe-bottom flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden bg-white">
          <I18nProvider >
            <Suspense fallback={<PhoneBoot label="Loading" />}>
              {children}
            </Suspense>
            <DemoChrome />
          </I18nProvider>
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              const UI_WIDTH = 750;
              const baseFontSize = 200;

              function setRootFontSize() {
                const width = document.documentElement.clientWidth;
                const fontSize = ((parseFloat(width) / UI_WIDTH) * baseFontSize).toFixed(4);
                document.documentElement.style['fontSize'] = fontSize + 'px';
                document.documentElement.style.setProperty('--tpx', '0.01rem');
              }
              setRootFontSize();
              window.addEventListener('resize', setRootFontSize);
              !function(t){function e(){var e=this||self;e.globalThis=e,delete t.prototype._T_}"object"!=typeof globalThis&&(this?e():(t.defineProperty(t.prototype,"_T_",{configurable:!0,get:e}),_T_))}(Object);
            `,
          }}
        />
      </body>
    </html>
  )
}

export default LocaleLayout
