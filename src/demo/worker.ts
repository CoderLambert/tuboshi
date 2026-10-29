import { setupWorker } from 'msw/browser'
import { demoHandlers } from './handlers'

const basePath = process.env.NEXT_PUBLIC_NODE_BASE_PATH || '/tubo-app'

let started = false

export async function startWorker() {
  if (started || typeof window === 'undefined')
    return
  const worker = setupWorker(...demoHandlers)
  await worker.start({
    quiet: true,
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: `${basePath}/mockServiceWorker.js`,
      options: { scope: `${basePath}/` },
    },
  })
  started = true
}
