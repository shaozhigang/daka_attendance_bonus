let updateServiceWorker: ((reloadPage?: boolean) => Promise<void>) | undefined

/** 注册 PWA Service Worker，供设置页触发更新 */
export function bindServiceWorkerUpdater(
  updater: (reloadPage?: boolean) => Promise<void>,
): void {
  updateServiceWorker = updater
}

/** 检查是否有 waiting 中的新版本并立即激活 */
export async function checkForUpdate(): Promise<'updated' | 'latest' | 'unsupported'> {
  if (!('serviceWorker' in navigator)) return 'unsupported'

  const registration = await navigator.serviceWorker.getRegistration()
  if (!registration) return 'unsupported'

  await registration.update()

  if (registration.waiting && navigator.serviceWorker.controller) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    return 'updated'
  }

  if (updateServiceWorker) {
    await updateServiceWorker(false)
    const reg = await navigator.serviceWorker.getRegistration()
    if (reg?.waiting) {
      await updateServiceWorker(true)
      return 'updated'
    }
  }

  return 'latest'
}

/** 清理 Service Worker 与 Cache Storage，然后强制拉取最新版本 */
export async function clearCacheAndReload(): Promise<void> {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map((reg) => reg.unregister()))
  }

  if ('caches' in window) {
    const keys = await caches.keys()
    await Promise.all(keys.map((key) => caches.delete(key)))
  }

  const url = new URL(window.location.href)
  url.searchParams.set('_refresh', String(Date.now()))
  window.location.replace(url.toString())
}
