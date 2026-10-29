let pending: Promise<void> | null = null

/** Load the mock API worker. Safe to call more than once. */
export function startDemo() {
  if (typeof window === 'undefined')
    return Promise.resolve()
  if (!pending) {
    pending = import('./worker')
      .then(mod => mod.startWorker())
      .catch((error) => {
        console.error('[demo] failed to start', error)
        pending = null
        throw error
      })
  }
  return pending
}
